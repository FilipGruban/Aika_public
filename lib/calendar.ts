import axiosInstance from "@/lib/axios";
import {getAppleCredentials, getOAuthToken} from "@/lib/tokens";
import {AccessRole, Provider} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {getAccount, getAllAccounts} from "@/lib/user";
import {decrypt} from "@/lib/encryption";
import {getAppleDavClient, getApplePrincipalUrl} from "@/lib/apple";
import {DAVNamespaceShort, propfind} from "tsdav";
import {ProviderCalendarResponse} from "@/types/calendar";

export async function getGoogleCalendar(calendarId: string, userId: string){
    try {
        const accessToken = await getOAuthToken(userId, "google");

        if(!accessToken){
            return null;
        }

        const calendar = await axiosInstance.get(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(calendarId)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });

        return {
            providerCalendarId: calendar.data.id,
            name: calendar.data.summary,
            accessRole: calendar.data.accessRole,
            timeZone: calendar.data.timeZone,
            selected: true,
            provider: "google" as Provider,
        }
    }
    catch(error){
        console.log(error);
        return null;
    }

}

export async function getMicrosoftCalendar(calendarId: string, userId: string) {
    try {
        const accessToken = await getOAuthToken(userId, "microsoft");

        if(!accessToken){
            return null;
        }

        const calendar = await axiosInstance.get(`https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const eventsResponse = await axiosInstance.get(
            `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`,
            {
                headers: {Authorization: `Bearer ${accessToken}`},
                params: {
                    '$top': 1,
                    '$select': 'start',
                }
            }
        );



        console.log(eventsResponse.data.value?.[0].start.timeZone);

        return {
            providerCalendarId: calendar.data.id,
            name: calendar.data.name,
            accessRole: await getMicrosoftAccessRole({canEdit: calendar.data.canEdit, owner: calendar.data.owner.address}, userId),
            timeZone: eventsResponse.data.value?.[0].start.timeZone || 'UTC',
            selected: true,
            provider: "microsoft" as Provider,
        };
    }
    catch(error){
        console.log(error);
        return null
    }
}

export async function getAppleCalendar(calendarId: string, userId: string) {
    try {
        const credentials = await getAppleCredentials(userId);
        if(!credentials){
            return null;
        }
        const password = decrypt(credentials.credential)

        const client = await getAppleDavClient({username: credentials.username, password});

        if(!client){
            return null;
        }

        const principalUrl = await getApplePrincipalUrl(credentials.username, password);

        const calendar = await propfind({
            url: `https://caldav.icloud.com/${principalUrl}/calendars/${encodeURIComponent(calendarId)}/`,
            props: {
                [`${DAVNamespaceShort.DAV}:displayname`]: {},
                [`${DAVNamespaceShort.CALDAV}:calendar-description`]: {},
                [`${DAVNamespaceShort.CALDAV}:calendar-timezone`]: {},
                [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
            },
            depth: '0',
            headers: {
                authorization: 'Basic ' + Buffer.from(`${credentials.username}:${password}`).toString('base64'),
            },
        })
        if (!calendar){
            return null;
        }

        console.log(calendar[0].props?.calendarTimezone);

        return {
            providerCalendarId: calendarId,
            name: calendar[0].props?.displayname || " ",
            accessRole: "owner" as AccessRole,
            timeZone: Object.keys(calendar[0].props?.calendarTimezone).length !== 0 ? calendar[0].props?.calendarTimezone : 'UTC',
            selected: true,
            provider:"apple" as Provider,
        };
    }
    catch(error){
        console.log(error);
        return null;
    }
}

export async function getCalendarById(calendarId: string, userId: string){
    try {
        return await prisma.calendar.findUnique({
            where: {
                providerCalendarId: calendarId,
                userId: userId
            },
        })
    }
    catch(error) {
        console.log(error)
        return null;
    }
}

export async function getUsedCalendarIds(userId: string, provider?: Provider, excludeGroupId?: string): Promise<string[]> {
    const usedCalendars = await prisma.calendar.findMany({
        where: {
            userId,
            provider,
            OR: [
                { groupId: { not: null } },
                { primaryOf: { isNot: null } }
            ],
            ...(excludeGroupId && {
                NOT: {groupId: excludeGroupId}
            })
        },
        select: {
            providerCalendarId: true
        }
    });

    return usedCalendars.map(cal => cal.providerCalendarId);
}


export async function getMicrosoftAccessRole(calendar: { canEdit: boolean; owner: string }, userId: string): Promise<AccessRole> {
    const microsoftAccount = await getAccount(userId, "microsoft");

    if (!calendar.canEdit) return "reader";
    if (calendar.owner === microsoftAccount?.providerEmail) return "owner";
    return "writer";
}

export function filterCalendarsByParams({calendars, used, owner} : {calendars : ProviderCalendarResponse[], used : string | null, owner : string | null}) {
    if (used === 'false') {
        calendars = calendars.filter(cal => !cal.used);
    } else if (used === 'true') {
        calendars = calendars.filter(cal => cal.used);
    }
    if (owner === 'true') {
        calendars = calendars.filter(cal => cal.accessRole === 'owner');
    }
    return calendars;
}

export async function getCalendarFromProvider(provider: Provider, calendarId: string, userId: string) {
    let calendar : ProviderCalendarResponse | null = null;

    switch (provider){
        case "google":
            calendar = await getGoogleCalendar(calendarId, userId);
            break;
        case "microsoft":
            calendar = await getMicrosoftCalendar(calendarId, userId);
            break;
        case "apple":
            calendar = await getAppleCalendar(calendarId, userId);
            break;
    }

    return calendar;
}

export async function upsertCalendar(calendar : ProviderCalendarResponse, accountId: string, userId : string, provider: Provider) {
    try {
        return await prisma.calendar.upsert({
            where: { providerCalendarId: calendar.providerCalendarId },
            update: {
                name: calendar.name,
                accessRole: calendar.accessRole,
                accountId: accountId,
                userId: userId,
                provider: provider,
                timeZone: calendar.timeZone,
            },
            create: {
                providerCalendarId: calendar.providerCalendarId,
                name: calendar.name,
                accessRole: calendar.accessRole,
                accountId: accountId,
                userId: userId,
                provider: provider,
                timeZone: calendar.timeZone,
            },
        });
    }
    catch(error) {
        console.log("Failed to upsert calendar:", error);
        return null;
    }
}

export async function upsertManyCalendars(calendars : ProviderCalendarResponse[], userId : string, groupId: string | null = null) {
    try {
        const accounts = await getAllAccounts(userId);

        if(!accounts) return null;

        const accountMap = new Map(
            accounts.map(acc => [acc.provider, acc.id])
        );

        const operations = calendars.map((calendar) => {
            const accountId = accountMap.get(calendar.provider);

            if (!accountId) {
                throw new Error(`No account found for provider ${calendar.provider}`);
            }

            return prisma.calendar.upsert({
                where: { providerCalendarId: calendar.providerCalendarId },
                update: {
                    name: calendar.name,
                    accessRole: calendar.accessRole,
                    accountId: accountId,
                    userId: userId,
                    provider: calendar.provider,
                    groupId: groupId,
                    timeZone: calendar.timeZone,
                },
                create: {
                    providerCalendarId: calendar.providerCalendarId,
                    name: calendar.name,
                    accessRole: calendar.accessRole,
                    accountId: accountId,
                    userId: userId,
                    provider: calendar.provider,
                    groupId: groupId,
                    timeZone: calendar.timeZone,
                },
            })
        }
        )

        return await prisma.$transaction(operations)
    }
    catch(error) {
        console.log("Failed to upsert calendars:", error);
        return null;
    }
}

export async function removeAllFromGroup(groupId: string) {
    try {
        await prisma.calendar.updateMany({
            where: {
                groupId
            },
            data:{
                groupId: null
            }
        })
    }
    catch(error) {
        console.log("Failed to remove calendars:", error);
        return null;
    }
}

export async function getCalendarGroup(groupId: string, userId: string) {
    try {
        return await prisma.calendarGroup.findUnique({
            where: {
                id: groupId,
                userId: userId,
            },
            include:{
                primaryCalendar: true,
                calendars: true,
                settings: true
            }
        })
    }
    catch(error) {
        console.log("Failed to get calendar group:", error);
        return null;
    }
}


