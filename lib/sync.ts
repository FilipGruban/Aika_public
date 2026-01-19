import {getCalendarGroup} from "@/lib/calendar";
import {prisma} from "@/lib/prisma";
import {Event} from '@prisma/client'
import {getAppleCredentials, getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {flowProducer} from "@/lib/flowProducer";
import {createCalendarObject} from "tsdav"
import {getApplePrincipalUrl} from "@/lib/apple";
import {decrypt} from "@/lib/encryption";
import {convertRRuleToMicrosoftRecurrence} from "@/lib/utils";

export async function scheduleCalendarSync(groupId: string, userId: string) {

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

    await flowProducer.add({
        name: "calendar-sync",
        queueName: "calendar-sync",
        data: {
            userId,
            groupId,
        },
        children
    });

}


export async function syncCalendarGroup(groupId: string, userId: string) {
    const group = await getCalendarGroup(groupId, userId);

    if (!group) {
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

    const googleToAdd = new Map<string, Event[]>();
    const microsoftToAdd = new Map<string, Event[]>();
    const appleToAdd = new Map<string, Event[]>();

    for (const primaryEvent of primaryEvents) {
        for(const calendar of secondaryCalendars) {
           if (calendar.events.find((e) => isSameEvent(primaryEvent, e))) continue;
           switch (calendar.provider){
               case "google":
                   push(googleToAdd, calendar.providerCalendarId, primaryEvent);
                   break;
               case "apple":
                   push(appleToAdd, calendar.providerCalendarId, primaryEvent);
                   break;
               case "microsoft":
                   push(microsoftToAdd, calendar.providerCalendarId, primaryEvent);
                   break;
           }
       }
    }

    await addGoogleEvents(googleToAdd, userId);
    await addMicrosoftEvents(microsoftToAdd, userId);
    await addAppleEvents(appleToAdd, userId);
}
function push(map: Map<string, Event[]>, calendarId: string, event: Event) {
    if (!map.has(calendarId)) {
        map.set(calendarId, []);
    }
    map.get(calendarId)!.push(event);
}
function isSameEvent(a : Event, b :Event): boolean {
    if (a.isAllDay !== b.isAllDay) return false;

    if (a.recurrenceRule && b.recurrenceRule && normalizeTitle(a.title) === normalizeTitle(b.title) && a.isAllDay === b.isAllDay) return true;

    if (normalizeTitle(a.title) !== normalizeTitle(b.title)) return false;

    if (normalizeDateTime(a.start) !== normalizeDateTime(b.start)) return false;

    if (normalizeDateTime(a.end) !== normalizeDateTime(b.end)) return false;

    if (a.status === 'cancelled' || b.status === 'cancelled') return false;

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
function toDateOnly(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


async function addGoogleEvents(eventsToAdd : Map<string, Event[]>, userId: string) {
    try{
        const accessToken = await getOAuthToken(userId, "google");
        if (!accessToken) {
            return null;
        }
        await Promise.all(
            [...eventsToAdd].flatMap(([calendarId, events]) =>
                events.map(event =>
                axiosInstance.post(
                    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
                    {
                        summary: event.title,
                        description: event.description,
                        location: event.location,
                        status: event.status,
                        start: event.isAllDay
                            ? { date: toDateOnly(event.start) }
                            : {
                                dateTime: event.start.toISOString(),
                                timeZone: 'UTC'
                            },
                        end: event.isAllDay
                            ? { date: toDateOnly(event.end) }
                            : {
                                dateTime: event.end.toISOString(),
                                timeZone: 'UTC'
                            },
                        recurrence: event.recurrenceRule ? [event.recurrenceRule] : undefined,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                )
            )
        ));
        return eventsToAdd;
    }
    catch(e){
        console.error(e);
        return null;
    }
}

async function addMicrosoftEvents(eventsToAdd : Map<string, Event[]>, userId: string) {
    try {
        const accessToken = await getOAuthToken(userId, "microsoft");
        if (!accessToken) {
            return null;
        }

        await Promise.all(
            [...eventsToAdd].flatMap(([calendarId, events]) =>
                events.map(event =>{
                    axiosInstance.post(`https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,{
                            subject: event.title,
                            body: {
                                contentType: "text",
                                content: event.description || ""
                            },
                            start: event.isAllDay
                                ? {
                                    dateTime: event.start.toISOString().split('T')[0],
                                    timeZone: "UTC"
                                }
                                : {
                                    dateTime: event.start.toISOString().replace(/\.\d{3}Z$/, ''),
                                    timeZone: "UTC"
                                },
                            end: event.isAllDay
                                ? {
                                    dateTime: event.end.toISOString().split('T')[0],
                                    timeZone: "UTC"
                                }
                                : {
                                    dateTime: event.end.toISOString().replace(/\.\d{3}Z$/, ''),
                                    timeZone: "UTC"
                                },
                            location: event.location
                                ? {
                                    displayName: event.location
                                }
                                : undefined,
                            isAllDay: event.isAllDay,
                            recurrence: convertRRuleToMicrosoftRecurrence(event.recurrenceRule, event.start),
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            }
                        })
                }
        ))
        )
        return eventsToAdd;
    }
    catch(e) {
        console.error(e);
        return null;
    }
}

async function addAppleEvents(eventsToAdd : Map<string, Event[]>, userId: string) {
    try {
        const credentials = await getAppleCredentials(userId);
        if (!credentials) {
            return null;
        }
        const password = decrypt(credentials.credential)
        const principalUrl = await getApplePrincipalUrl(credentials.username, password);

        const formatDate = (date: Date, isAllDay: boolean) => {
            if (isAllDay) {
                return date.toISOString().split('T')[0].replace(/-/g, '');
            } else {
                return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            }
        };

        await Promise.all(
            [...eventsToAdd].flatMap(([calendarId, events]) =>
                events.map(event => {

                    const eventId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

                    const calendarUrl =`https://caldav.icloud.com/${principalUrl}/calendars/${encodeURIComponent(calendarId)}/`


                    const icsLines = [
                        'BEGIN:VCALENDAR',
                        'VERSION:2.0',
                        'PRODID:-//Your App//Your App//EN',
                        'BEGIN:VEVENT',
                        `UID:${eventId}`,
                        `DTSTAMP:${formatDate(new Date(), false)}`,
                        `DTSTART${event.isAllDay ? ';VALUE=DATE' : ''}:${formatDate(event.start, event.isAllDay)}`,
                        `DTEND${event.isAllDay ? ';VALUE=DATE' : ''}:${formatDate(event.end, event.isAllDay)}`,
                        `SUMMARY:${event.title}`,
                    ];

                    if (event.description) {
                        icsLines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
                    }

                    if (event.location) {
                        icsLines.push(`LOCATION:${event.location}`);
                    }

                    if (event.recurrenceRule) {
                        icsLines.push(event.recurrenceRule); // RRULE:FREQ=YEARLY
                    }

                    icsLines.push(
                        'STATUS:CONFIRMED',
                        'SEQUENCE:0',
                        'END:VEVENT',
                        'END:VCALENDAR'
                    );
                    const icsContent = icsLines.join('\r\n');

                    createCalendarObject({
                        calendar: {
                            url: calendarUrl,
                        },
                        filename: `${eventId}.ics`,
                        iCalString: icsContent,
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${credentials.username}:${password}`).toString('base64')}`,
                        },
                    });
                })
        ))

        return eventsToAdd;
    }
    catch(e) {
        console.error(e);
        return null;
    }
}