import {getCurrentUser} from "@/lib/authUser";
import {NextRequest, NextResponse} from "next/server";
import {getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {checkCalendarApiLimit} from "@/lib/rate-limits";
import {
    filterCalendarsByParams,
    getUsedCalendarIds
} from "@/lib/calendar";
import {ProviderCalendarResponse} from "@/types/calendar";
import {getCachedCalendars, setCachedCalendars} from "@/lib/cache";

export async function GET(req:NextRequest){
    try{
        const { searchParams } = new URL(req.url);
        const used = searchParams.get('used');
        const owner = searchParams.get('owner');

        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message: 'Unauthorized'}, {status:401});
        }

        const cached = await getCachedCalendars(user.id, "google");

        if(cached){
            const filteredCachedCalendars = filterCalendarsByParams({calendars: cached, used, owner})
            return NextResponse.json({message:"Successfully fetched calendars", data: filteredCachedCalendars}, {status: 200});
        }

        const rateLimit = await checkCalendarApiLimit(user.id, "google");

        if(!rateLimit.success){
            return NextResponse.json({message: rateLimit.message}, {status:429});
        }



        const accessToken = await getOAuthToken(user.id, "google");

        if(!accessToken){
            return NextResponse.json({message: "Google account not connected. Please reconnect in settings."}, {status: 404});
        }

        const res = await axiosInstance.get("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })
        const data = res.data;
        if(!data){
            return NextResponse.json({message:"No calendars found"}, {status: 404});
        }

        const usedCalendarIds = await getUsedCalendarIds(user.id, "google");

        let calendars: ProviderCalendarResponse[] = data.items.map((calendar: any) => {
            return {
                providerCalendarId: calendar.id,
                name: calendar.summary,
                description: calendar.description ?? null,
                timeZone: calendar.timeZone ?? null,
                primary: calendar.primary ?? false,
                accessRole: calendar.accessRole,
                used: usedCalendarIds.includes(calendar.id) ,
                provider: "google",
            };
        });

        await setCachedCalendars(user.id, "google", calendars);

        calendars = filterCalendarsByParams({calendars: calendars, used, owner})
        return NextResponse.json({message:"Successfully fetched calendars", data: calendars}, {status: 200});

    }
    catch(error){
        console.error('[Google Calendars API] Error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            statusCode: (error as any)?.response?.status
        });
        return NextResponse.json({message:"Failed to fetch calendars. Please try again later."}, {status: 500});
    }
}