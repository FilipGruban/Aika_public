import {getCalendarGroup} from "@/lib/calendar";
import {prisma} from "@/lib/prisma";
import {Event} from '@prisma/client'
import {flowProducer} from "@/lib/flowProducer";
import {addAppleEvents, addGoogleEvents, addMicrosoftEvents, deleteEvent} from "@/lib/event";
import pLimit from "p-limit";

export async function scheduleCalendarSync(groupId: string, userId: string, trigger : "automatic" | "manual") {

    const calendarGroup = await prisma.calendarGroup.findUnique(
        {
            where: {userId, id: groupId},
            include: {
                calendars: true,
                primaryCalendar: true,
            }
        });

    if (!calendarGroup || !calendarGroup.calendars) {
        return null;
    }

    const children = [];

    children.push({
        name: "fetch-events",
        queueName: 'fetch-events',
        data:{
            userId,
            calendarId: calendarGroup.primaryCalendar.id,
            provider: calendarGroup.primaryCalendar.provider,
            providerCalendarId: calendarGroup.primaryCalendar.providerCalendarId,
        },
        opts:{
            attempts: 5,
            backoff: {
                delay: 5000,
                type: "exponential"
            }
        },
    })


    for (const calendar of calendarGroup.calendars) {
        children.push({
            name: 'fetch-events',
            queueName: 'fetch-events',
            data: {
                userId,
                calendarId: calendar.id,
                provider: calendar.provider,
                providerCalendarId: calendar.providerCalendarId,
            },
            opts:{
                attempts: 5,
                backoff: {
                    delay: 5000,
                    type: "exponential"
                }
            },
        });
    }

    const syncLog = await prisma.syncLog.create({
        data:{
            userId,
            groupId,
            triggeredBy: trigger,
            status: "running"
        }
    })

    await flowProducer.add({
        name: "calendar-sync",
        queueName: "calendar-sync",
        data: {
            userId,
            groupId,
            syncLogId: syncLog.id,
        },
        children
    });
}


export async function syncCalendarGroup(groupId: string, userId: string, syncLogId: string) {
    const group = await getCalendarGroup(groupId, userId);

    if (!group) {
        return null;
    }

    if(!group.settings?.syncEnabled) {
        return null;
    }

    const secondaryCalendars = await prisma.calendar.findMany({
        where: {
            groupId: groupId,
            userId: userId,
        },
        include: {
            events: true
        }
    })

    const primaryEvents = await prisma.event.findMany({
        where: {
            calendarId: group.primaryCalendar.id
        },
        include: {
            calendar: true
        }
    });

    const googleToAdd = new Map<string, {dbCalendarId:string, events: Event[] }>();
    const microsoftToAdd = new Map<string, {dbCalendarId:string, events: Event[] }>();
    const appleToAdd = new Map<string, {dbCalendarId:string, events: Event[] }>();
    const eventsToDelete: Array<{event: Event, reason: 'name_duplicate'}> = [];
    const markedForDeletion = new Set<string>();


    for (const primaryEvent of primaryEvents) {
        for(const calendar of secondaryCalendars) {
            const matchResult = findMatchingEvent(
                primaryEvent,
                calendar.events,
                group.settings?.nameDuplicationEnabled
            );

            if (matchResult.exactMatch) continue;

            for (const duplicate of matchResult.nameDuplicates) {
                const isExactMatchForAnyPrimary = primaryEvents.some(pe => {
                    const tempMatch = findMatchingEvent(pe, [duplicate], true);
                    return tempMatch.exactMatch !== null;
                });

                if (isExactMatchForAnyPrimary) continue;

                if (!markedForDeletion.has(duplicate.id)) {
                    markedForDeletion.add(duplicate.id);
                    eventsToDelete.push({
                        event: duplicate,
                        reason: 'name_duplicate'
                    });
                }
            }

            switch (calendar.provider){
                case "google":
                    push(googleToAdd, calendar.providerCalendarId, calendar.id, primaryEvent);
                    break;
                case "apple":
                    push(appleToAdd, calendar.providerCalendarId, calendar.id, primaryEvent);
                    break;
                case "microsoft":
                    push(microsoftToAdd, calendar.providerCalendarId, calendar.id, primaryEvent);
                    break;
            }
        }
    }

        const limit = pLimit(3);


        const deletionResults = await Promise.all(
            eventsToDelete.map(({ event }) =>
                limit(() => deleteEvent(userId, event.provider, event.providerCalendarId, event.externalId))
            )
        );

        const googleResults = await addGoogleEvents(googleToAdd, userId);
        const microsoftResults = await addMicrosoftEvents(microsoftToAdd, userId);
        const appleResults = await addAppleEvents(appleToAdd, userId);

        const logEntries: Array<{
            action: 'added' | 'deleted' | 'failed';
            eventTitle: string;
            sourceCalendarId: string;
            targetCalendarId: string;
            error?: string;
            details?: any;
        }> = [];

        eventsToDelete.forEach(({ event }, index) => {
            const result = deletionResults[index];

            if (result.status === 'fulfilled') {
                logEntries.push({
                    action: 'deleted',
                    eventTitle: event.title,
                    sourceCalendarId: group.primaryCalendar.id,
                    targetCalendarId: event.calendarId,
                });
            } else {
                logEntries.push({
                    action: 'failed',
                    eventTitle: event.title,
                    sourceCalendarId: group.primaryCalendar.id,
                    targetCalendarId: event.calendarId,
                    error: `Delete failed: ${result.error}`,
                });
            }
        });

        [...googleResults.success, ...microsoftResults.success, ...appleResults.success].forEach(item => {
            logEntries.push({
                action: 'added',
                eventTitle: item.eventTitle,
                sourceCalendarId: group.primaryCalendar.id,
                targetCalendarId: item.targetCalendarId,
                details: item.details,
            });
        });

        [...googleResults.failed, ...microsoftResults.failed, ...appleResults.failed].forEach(item => {
            logEntries.push({
                action: 'failed',
                eventTitle: item.eventTitle,
                sourceCalendarId: group.primaryCalendar.id,
                targetCalendarId: item.targetCalendarId,
                error: item.error,
            });
        });

        await prisma.syncLogEntry.createMany({
            data: logEntries.map(entry => ({
                syncLogId: syncLogId,
                ...entry,
            }))
        });

        await prisma.syncLog.update({
            where: { id: syncLogId },
            data: {
                status: logEntries.some(e => e.action === 'failed') ? 'partial' : 'success',
                eventsAdded: logEntries.filter(e => e.action === 'added').length,
                eventsDeleted: logEntries.filter(e => e.action === 'deleted').length,
                eventsFailed: logEntries.filter(e => e.action === 'failed').length,
            }
        });

}
function push(map: Map<string, { dbCalendarId: string, events: Event[] }>, providerCalendarId: string, dbCalendarId: string, event: Event) {
    if (!map.has(providerCalendarId)) {
        map.set(providerCalendarId, { dbCalendarId, events: [] });
    }
    map.get(providerCalendarId)!.events.push(event);
}
function findMatchingEvent(
    primaryEvent: Event,
    secondaryEvents: Event[],
    nameDuplicationEnabled: boolean = true
): { exactMatch: Event | null, nameDuplicates: Event[]} {
    const nameDuplicates: Event[] = [];

    for (const secondaryEvent of secondaryEvents) {
        if (isSameEvent(primaryEvent, secondaryEvent)) {
            return { exactMatch: secondaryEvent, nameDuplicates: [] };
        }

        if (!nameDuplicationEnabled &&
            normalizeTitle(primaryEvent.title) === normalizeTitle(secondaryEvent.title)) {
            nameDuplicates.push(secondaryEvent);
        }
    }

    return { exactMatch: null, nameDuplicates };
}


function isSameEvent(a: Event, b: Event): boolean {
    const titleA = normalizeTitle(a.title);
    const titleB = normalizeTitle(b.title);

    if (titleA !== titleB) return false;

    if (a.recurrenceRule && b.recurrenceRule) {
        const freqA = a.recurrenceRule.match(/FREQ=(\w+)/)?.[1];
        const freqB = b.recurrenceRule.match(/FREQ=(\w+)/)?.[1];
        return freqA === freqB;
    }

    if (a.recurrenceRule || b.recurrenceRule) {
        return false;
    }

    if (a.isAllDay !== b.isAllDay) return false;

    if (a.isAllDay) {
        const dateA = new Date(a.start).toISOString().split('T')[0];
        const dateB = new Date(b.start).toISOString().split('T')[0];
        return dateA === dateB;
    }

    if (normalizeDateTime(a.start) !== normalizeDateTime(b.start)) return false;
    if (normalizeDateTime(a.end) !== normalizeDateTime(b.end)) return false;

    return true;
}

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeDateTime(d: Date): string {
    return d.toISOString();
}
