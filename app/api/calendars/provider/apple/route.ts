import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {getAppleCredentials} from "@/lib/tokens";
import {decrypt} from "@/lib/encryption";
import {getAppleDavClient, parseAppleCalendars} from "@/lib/apple";
import {checkCalendarApiLimit} from "@/lib/rate-limits";
import {
    filterCalendarsByParams,
    getUsedCalendarIds
} from "@/lib/calendar";
import {getCachedCalendars, setCachedCalendars} from "@/lib/cache";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const used = searchParams.get('used');
        const owner = searchParams.get('owner');

        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message:"Unauthorized"}, {status: 401})
        }

        const cached = await getCachedCalendars(user.id, "apple");

        if(cached){
            const filteredCachedCalendars = filterCalendarsByParams({calendars: cached, used, owner})
            return NextResponse.json({message:"Successfully fetched calendars", data: filteredCachedCalendars}, {status: 200});
        }


        const rateLimit = await checkCalendarApiLimit(user.id, "apple");

        if(!rateLimit.success){
            return NextResponse.json({message: rateLimit.message}, {status:429});
        }

        const credentials = await getAppleCredentials(user.id);
        if(!credentials){
            return NextResponse.json({message:"Apple account not connected. Please reconnect in settings."}, {status: 404});
        }

        const client = await getAppleDavClient({username: credentials.username, password:decrypt(credentials.credential)});

        if(!client){
            return NextResponse.json({message:"Failed to authenticate with Apple. Please reconnect your account."}, {status: 401});
        }

        const responseCalendars = await client.fetchCalendars();

        const usedCalendarsId = await getUsedCalendarIds(user.id, "apple");

        let calendars = parseAppleCalendars(responseCalendars, usedCalendarsId);

        await setCachedCalendars(user.id, "apple", calendars);

        calendars = filterCalendarsByParams({calendars: calendars, used, owner})

        return NextResponse.json({message:"Successfully fetched calendars", data: calendars}, {status: 200});
    }
    catch(error){
        console.error('[Apple Calendars API] Error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json({message:"Failed to fetch calendars. Please try again later."}, {status: 500});
    }
}





/*const userHash = await getApplePrincipalUrl(credentials.username, password);
        const url = `https://caldav.icloud.com/${userHash}/calendars/`

        const res = await axiosInstance.request({
            method: "PROPFIND",
            url,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                Depth: "1"
            },
            auth: {
                username: credentials.username,
                password: password,
            },
            data: `<?xml version="1.0" encoding="UTF-8"?>
                <d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
                  <d:prop>
                    <d:displayname />
                    <d:resourcetype />
                  </d:prop>
                </d:propfind>`
        });

        if(!res.data){
            return NextResponse.json({message:"Failed to fetch apple calendars"}, {status: 400})
        }

        const data = parseCalDavResponse(res.data);

        const usedAppleCalndars = await getUsedCalendarsId("apple", user.id );

        const calendars = data.filter((entry: AppleCalDAVEntry) => {
            if (Array.isArray(entry.propstat)) return false;

            return !!entry.propstat?.prop?.resourcetype?.calendar;
        }).map((entry:AppleCalendarEntry) => ({
            id: entry.href._text.split("/").filter(Boolean).pop()!,
                name: entry.propstat.prop.displayname._text,
                description: "",
                timeZone: null,
                primary: false,
                accessRole: "owner",
                selected: false,
                used: usedAppleCalndars.includes(entry.href._text.split("/").filter(Boolean).pop()!)
        }))
*/