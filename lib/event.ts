import {getAppleCredentials, getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {Event} from "@/types/event";
import {getApplePrincipalUrl} from "@/lib/apple";
import {decrypt} from "@/lib/encryption";
import {calendarQuery, DAVNamespaceShort} from "tsdav";
import {
    convertAppleRecurrenceToRRule,
    convertGoogleRecurrenceToRRule,
    convertMicrosoftRecurrenceToRRule
} from "@/lib/utils";
import ICAL from "ical.js";

export async function getGoogleCalendarEvents(userId : string, calendarId: string) : Promise<Event[] | null> {
    const accessToken = await getOAuthToken(userId, "google");

    if(!accessToken){
        return null;
    }

    const now = new Date().toISOString();
    const events = await axiosInstance.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        params: {
            timeMin: now,
            maxResults: 250
        }
    });

    if(!events.data){
        return null;
    }

    return events.data.items.map((event : any) => parseGoogleEvent(event, calendarId));
}

function parseGoogleEvent(googleEvent: any, calendarId: string) : Event {


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

export async function getMicrosoftCalendarEvents(userId : string, calendarId: string) {
    const accessToken = await getOAuthToken(userId, "microsoft");

    if(!accessToken){
        return null;
    }

    const futureDate = new Date().toISOString();

    const events = await axiosInstance.get(`https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`,{
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        params: {
            '$filter': `type eq 'seriesMaster' or (type eq 'singleInstance' and start/dateTime ge '${futureDate}')`,
            '$orderby': 'start/dateTime',
        }
    })


    if(!events.data){
        return null;
    }

    return events.data.value.map((event : any) => parseMicrosoftEvent(event, calendarId));

}

function parseMicrosoftEvent(microsoftEvent: any, calendarId: string): Event {

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


export async function getAppleCalendarEvents(userId : string, calendarId: string) {
    const credentials = await getAppleCredentials(userId);

    if(!credentials){
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
): Event[] {
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


                return {
                    providerEventId: event.uid,
                    calendarId: calendarId,
                    title: event.summary || 'Untitled Event',
                    description: event.description || null,
                    location: event.location || null,
                    startTime: event.startDate.toJSDate(),
                    endTime: event.endDate.toJSDate(),
                    isAllDay: event.startDate.isDate,
                    recurrenceRule: convertAppleRecurrenceToRRule(vevent) || null,
                    status: 'confirmed',
                };
            } catch (error) {
                console.error('Failed to parse Apple event:', error);
                return null;
            }
        })
        .filter((event): event is Event => event !== null);
}