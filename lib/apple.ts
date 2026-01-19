import axios from "axios";
import {createDAVClient, DAVCalendar} from "tsdav";
import {ProviderCalendarResponse} from "@/types/calendar";
import {xml2json} from "xml-js";
import {AccessRole} from "@prisma/client";
import ICAL from 'ical.js';
import {Event} from "@/types/event";

export async function getApplePrincipalUrl(username: string, appPassword: string): Promise<string> {
    const authHeader = "Basic " + Buffer.from(`${username}:${appPassword}`).toString("base64");

    const res = await axios.request({
        method: "PROPFIND",
        url: "https://caldav.icloud.com/.well-known/caldav",
        headers: {
            "Content-Type": "application/xml",
            "Depth": "0",
            Authorization: authHeader,
        },
    });

    const stringRes = xml2json(res.data, { compact: true });
    const jsonRes = JSON.parse(stringRes);

    const principalUrl = jsonRes?.multistatus?.response?.href?._text;
    if (!principalUrl) throw new Error("Failed to extract Apple principal URL");
    const userId = extractAppleUserIdFromPath(principalUrl);
    if(!userId) throw new Error("Failed to extract Apple principal");
    return userId ;
}

export function extractAppleUserIdFromPath(path: string): string | null {
    const match = path.match(/^\/(\d{5,})\//);
    return match ? match[1] : null;
}


export async function getAppleDavClient({username, password} : {username: string, password: string}) {
    try {
        return await createDAVClient({
            serverUrl: 'https://caldav.icloud.com',
            credentials: {
                username,
                password
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav'
        });
    }
    catch (e) {
        console.error(e);
        return null;
    }

}

export function parseAppleCalendars(
    calendars: DAVCalendar[],
    usedCalendarIds: string[],
): ProviderCalendarResponse[] {
    return calendars
        .filter(calendar => calendar.components?.includes('VEVENT'))
        .map(calendar => {
            const urlParts = calendar.url.split('/');
            const calendarId = urlParts[urlParts.length - 2];

            return {
                providerCalendarId: calendarId,
                name: calendar.displayName as string,
                description: calendar.description || undefined,
                timeZone: calendar.timezone || undefined,
                accessRole: 'owner' as AccessRole,
                used: usedCalendarIds.includes(calendarId),
                provider: "apple"
            };
        });
}


