import {getAppleCredentials, getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {EventDTO, EventSyncResult} from "@/types/event";
import {getApplePrincipalUrl} from "@/lib/apple";
import {decrypt} from "@/lib/encryption";
import {calendarQuery, createCalendarObject, DAVNamespaceShort, deleteObject} from "tsdav";
import {
    convertAppleRecurrenceToRRule,
    convertGoogleRecurrenceToRRule,
    convertMicrosoftRecurrenceToRRule, convertRRuleToMicrosoftRecurrence
} from "@/lib/utils";
import ICAL from "ical.js";
import {Event, Provider} from "@prisma/client";
import pLimit from "p-limit";

export async function getGoogleCalendarEvents(userId: string, calendarId: string): Promise<EventDTO[] | null> {
    const accessToken = await getOAuthToken(userId, "google");

    if (!accessToken) {
        return null;
    }

    const events = await axiosInstance.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        params: {
            maxResults: 250,
            singleEvents: false,
        }
    });

    if (!events.data) {
        return null;
    }
    const now = new Date();
    const filteredEvents = events.data.items.filter((event: any) => {
        // Keep all recurring events
        if (event.recurrence) {
            return true;
        }

        // For non-recurring, only keep future events
        const eventEnd = new Date(event.end?.dateTime || event.end?.date);
        return eventEnd >= now;
    });

    return filteredEvents.map((event: any) => parseGoogleEvent(event, calendarId));
}

function parseGoogleEvent(googleEvent: any, calendarId: string): EventDTO {

    return {
        providerEventId: googleEvent.id,
        calendarId: calendarId,
        title: googleEvent.summary || 'Untitled Event',
        description: googleEvent.description || null,
        location: googleEvent.location || null,
        startTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
        endTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
        isAllDay: !googleEvent.start.dateTime,
        recurrenceRule: convertGoogleRecurrenceToRRule(googleEvent.recurrence) || null,
        status: googleEvent.status,
    };
}

export async function getMicrosoftCalendarEvents(userId: string, calendarId: string) {
    const accessToken = await getOAuthToken(userId, "microsoft");

    if (!accessToken) {
        return null;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const futureDate = now.toISOString();

    const events = await axiosInstance.get(`https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        params: {
            '$filter': `type eq 'seriesMaster' or (type eq 'singleInstance' and start/dateTime ge '${futureDate}')`,
            '$orderby': 'start/dateTime',
            '$top': 999
        }
    })


    if (!events.data) {
        return null;
    }

    return events.data.value.map((event: any) => parseMicrosoftEvent(event, calendarId)).filter((e: EventDTO)=>{
        const skip = e.isAllDay || !!e.recurrenceRule;

        const nowLocal = new Date();
        const endTime = new Date(e.endTime)

        if (skip) return true;

        return endTime > nowLocal;
    });

}

function parseMicrosoftEvent(microsoftEvent: any, calendarId: string): EventDTO {

    const startDateTime = microsoftEvent.start.timeZone === 'UTC'
        ? microsoftEvent.start.dateTime + 'Z'
        : microsoftEvent.start.dateTime;

    const endDateTime = microsoftEvent.end.timeZone === 'UTC'
        ? microsoftEvent.end.dateTime + 'Z'
        : microsoftEvent.end.dateTime;

    return {
        providerEventId: microsoftEvent.id,
        calendarId: calendarId,
        title: microsoftEvent.subject || 'Untitled Event',
        description: microsoftEvent.bodyPreview || null,
        location: microsoftEvent.location?.displayName || null,
        startTime: new Date(startDateTime),
        endTime: new Date(endDateTime),
        isAllDay: microsoftEvent.isAllDay,
        recurrenceRule: convertMicrosoftRecurrenceToRRule(
            microsoftEvent.recurrence,
            new Date(startDateTime)
        ) || null,
        status: microsoftEvent.isCancelled ? 'cancelled' : 'confirmed',
    };
}


export async function getAppleCalendarEvents(userId: string, calendarId: string) {
    const credentials = await getAppleCredentials(userId);

    if (!credentials) {
        return null;
    }

    const password = decrypt(credentials.credential)

    const principalUrl = await getApplePrincipalUrl(credentials.username, password);
    const now = new Date().toISOString();
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const events = await calendarQuery({
        url: `https://caldav.icloud.com/${principalUrl}/calendars/${encodeURIComponent(calendarId)}/`,
        props: {
            [`${DAVNamespaceShort.DAV}:getetag`]: {},
            [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
        },
        filters: {
            'comp-filter': {
                _attributes: {
                    name: 'VCALENDAR',
                },
                'comp-filter': {
                    _attributes: {
                        name: 'VEVENT',
                    },
                    'time-range': {
                        _attributes: {
                            start: now,
                            end: oneYearLater,
                        },
                    },
                },
            },
        },
        depth: '1',
        headers: {
            authorization: 'Basic ' + Buffer.from(`${credentials.username}:${password}`).toString('base64'),
        },
    })

    return parseAppleEvents(events, calendarId);
}

export function parseAppleEvents(
    calendarObjects: any[],
    calendarId: string
): EventDTO[] {
    const now = new Date();
    return calendarObjects
        .map(obj => {
            try {
                const iCalData = obj.props?.calendarData?._cdata;

                if (!iCalData) {
                    console.warn('No calendar data found');
                    return null;
                }

                const jcalData = ICAL.parse(iCalData);
                const comp = new ICAL.Component(jcalData);
                const vevent = comp.getFirstSubcomponent('vevent');

                if (!vevent) {
                    console.warn('No VEVENT found');
                    return null;
                }

                const event = new ICAL.Event(vevent);
                const isAllDay = event.startDate.isDate;

                let startTime: Date;
                let endTime: Date;

                if (isAllDay) {
                    const startDate = event.startDate;
                    const endDate = event.endDate;

                    startTime = new Date(Date.UTC(
                        startDate.year,
                        startDate.month - 1,
                        startDate.day,
                        0, 0, 0, 0
                    ));

                    endTime = new Date(Date.UTC(
                        endDate.year,
                        endDate.month - 1,
                        endDate.day,
                        0, 0, 0, 0
                    ));
                } else {
                    startTime = event.startDate.toJSDate();
                    endTime = event.endDate.toJSDate();
                }

                return {
                    providerEventId: event.uid,
                    calendarId: calendarId,
                    title: event.summary || 'Untitled Event',
                    description: event.description || null,
                    location: event.location || null,
                    startTime: startTime,
                    endTime: endTime,
                    isAllDay: isAllDay,
                    recurrenceRule: convertAppleRecurrenceToRRule(vevent) || null,
                    status: 'confirmed',
                };
            } catch (error) {
                console.error('Failed to parse Apple event:', error);
                return null;
            }
        })
        .filter((event): event is EventDTO => event !== null)
        .filter(event => {
            if (event.recurrenceRule) {
                return true;
            }
            return new Date(event.endTime) >= now;
        });
}

function toDateOnly(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}





export async function addGoogleEvents(eventsToAdd: Map<string, { dbCalendarId: string, events: Event[] }>, userId: string) : Promise<EventSyncResult> {
    const result: EventSyncResult = { success: [], failed: [] };
    try {
        const accessToken = await getOAuthToken(userId, "google");
        if (!accessToken) {
            for (const [_, {events, dbCalendarId}] of eventsToAdd) {
                events.forEach(event => {
                    result.failed.push({
                        eventTitle: event.title,
                        targetCalendarId: dbCalendarId,
                        error: 'No access token'
                    });
                });
            }
        return result;
        }

        const limit = pLimit(3)

        await Promise.all(
            [...eventsToAdd].flatMap(([calendarId, {dbCalendarId, events}]) =>
                events.map(event =>
                    limit(async ()=>{
                        try{
                            await axiosInstance.post(
                                `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
                                {
                                    summary: event.title,
                                    description: event.description,
                                    location: event.location,
                                    status: event.status,
                                    start: event.isAllDay
                                        ? {date: toDateOnly(event.start)}
                                        : {
                                            dateTime: event.start.toISOString(),
                                            timeZone: 'UTC'
                                        },
                                    end: event.isAllDay
                                        ? {date: toDateOnly(event.end)}
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

                            result.success.push({
                                eventTitle: event.title,
                                targetCalendarId: dbCalendarId,
                                details: {
                                    startTime: event.start,
                                    isAllDay: event.isAllDay,
                                }
                            });
                        }
                        catch(error){
                            result.failed.push({
                                eventTitle: event.title,
                                targetCalendarId: dbCalendarId,
                                error: 'Unknown error'
                            });
                        }
                    }
                    )
                )
            ));
        return result;
    } catch (e) {
        console.error(e);
        for (const [_, {events, dbCalendarId}] of eventsToAdd) {
            events.forEach(event => {
                result.failed.push({
                    eventTitle: event.title,
                    targetCalendarId: dbCalendarId,
                    error: 'Unknown error occurred'
                });
            });
        }
        return result;
    }
}

export async function addMicrosoftEvents(eventsToAdd: Map<string, { dbCalendarId: string, events: Event[] }>, userId: string): Promise<EventSyncResult> {
    const result: EventSyncResult = { success: [], failed: [] };
    try {
        const accessToken = await getOAuthToken(userId, "microsoft");
        if (!accessToken) {
            for (const [_, {events, dbCalendarId}] of eventsToAdd) {
                events.forEach(event => {
                    result.failed.push({
                        eventTitle: event.title,
                        targetCalendarId: dbCalendarId,
                        error: 'No access token'
                    });
                });
            }
            return result;
        }

        const limit = pLimit(3)

        await Promise.all(
            [...eventsToAdd].flatMap(([calendarId, {dbCalendarId, events}]) =>
                events.map(event =>
                    limit(async ()=>{
                        try {
                            await axiosInstance.post(`https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`, {
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


                            result.success.push({
                                eventTitle: event.title,
                                targetCalendarId: dbCalendarId,
                                details: {
                                    startTime: event.start,
                                    isAllDay: event.isAllDay,
                                }
                            });
                        }catch(error){
                            result.failed.push({
                                eventTitle: event.title,
                                targetCalendarId: dbCalendarId,
                                error: 'Unknown error'
                            });
                        }}
                    )
                ))
        )
        return result;
    } catch (e) {
        console.error(e);
        for (const [_, {dbCalendarId, events}] of eventsToAdd) {
            events.forEach(event => {
                result.failed.push({
                    eventTitle: event.title,
                    targetCalendarId: dbCalendarId,
                    error: 'Unknown error occurred'
                });
            });
        }
        return result;
    }
}

export async function addAppleEvents(eventsToAdd: Map<string, { dbCalendarId: string, events: Event[] }>, userId: string) : Promise<EventSyncResult> {
    const result: EventSyncResult = { success: [], failed: [] };
    try {
        const credentials = await getAppleCredentials(userId);
        if (!credentials) {
            for (const [_, {events, dbCalendarId}] of eventsToAdd) {
                events.forEach(event => {
                    result.failed.push({
                        eventTitle: event.title,
                        targetCalendarId: dbCalendarId,
                        error: 'Invalid apple credentials'
                    });
                });
            }
            return result;
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

        const limit = pLimit(3)

        await Promise.all(
            [...eventsToAdd].flatMap(([calendarId, {dbCalendarId, events}]) =>
                events.map(event =>
                    limit(async ()=>{
                        try {
                            const eventId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

                            const calendarUrl = `https://caldav.icloud.com/${principalUrl}/calendars/${encodeURIComponent(calendarId)}/`


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

                            await createCalendarObject({
                                calendar: {
                                    url: calendarUrl,
                                },
                                filename: `${eventId}.ics`,
                                iCalString: icsContent,
                                headers: {
                                    Authorization: `Basic ${Buffer.from(`${credentials.username}:${password}`).toString('base64')}`,
                                },
                            });

                            result.success.push({
                                eventTitle: event.title,
                                targetCalendarId: dbCalendarId,
                                details: {
                                    startTime: event.start,
                                    isAllDay: event.isAllDay,
                                }
                            });
                        }
                        catch(error){
                            result.failed.push({
                                eventTitle: event.title,
                                targetCalendarId: dbCalendarId,
                                error: 'Unknown error'
                            });
                        }
                    })
                )
            ))

        return result;
    } catch (e) {
        console.error(e);
        for (const [_, {dbCalendarId, events}] of eventsToAdd) {
            events.forEach(event => {
                result.failed.push({
                    eventTitle: event.title,
                    targetCalendarId: dbCalendarId,
                    error: 'Unknown error occurred'
                });
            });
        }
        return result;
    }
}


export async function deleteEvent(userId: string, provider: Provider, calendarId: string, eventId: string) {
    try {
        switch (provider) {
            case 'google':
                await deleteGoogleEvent(userId, calendarId, eventId);
                break;
            case 'microsoft':
                await deleteMicrosoftEvent(userId, calendarId, eventId);
                break;
            case 'apple':
                await deleteAppleEvent(userId, calendarId, eventId);
                break;
        }
        return {status : "fulfilled"};
    }
    catch (error) {
        return {status : "failed", error: error || "Something went wrong" };
    }
}


async function deleteGoogleEvent(userId: string, calendarId: string, eventId: string) {
    const accessToken = await getOAuthToken(userId, "google");

    if (!accessToken) {
        return null;
    }

    await axiosInstance.delete(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

}

async function deleteMicrosoftEvent(userId: string, calendarId: string, eventId: string) {
    const accessToken = await getOAuthToken(userId, "microsoft");

    if (!accessToken) {
        return null;
    }

    await axiosInstance.delete(
        `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events/${eventId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        }

    );
}

async function deleteAppleEvent(userId: string, calendarId: string, eventId: string) {
    const credentials = await getAppleCredentials(userId);

    if (!credentials) {
        return null;
    }

    const password = decrypt(credentials.credential)

    const principalUrl = await getApplePrincipalUrl(credentials.username, password);

    const eventUrl = `https://caldav.icloud.com/${principalUrl}/calendars/${encodeURIComponent(calendarId)}/${eventId}.ics`;

    await deleteObject({
        url: eventUrl,
        headers: {
            authorization: 'Basic ' + Buffer.from(`${credentials.username}:${password}`).toString('base64'),
        },
    });
}