import {getCurrentUser} from "@/lib/authUser";
import {NextRequest, NextResponse} from "next/server";
import {getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {
    filterCalendarsByParams,
    getMicrosoftAccessRole, getUsedCalendarIds
} from "@/lib/calendar";
import {checkCalendarApiLimit} from "@/lib/rate-limits";
import {ProviderCalendarResponse} from "@/types/calendar";
import {getCachedCalendars, setCachedCalendars} from "@/lib/cache";

export async function GET(req: NextRequest) {
    try{
        const { searchParams } = new URL(req.url);
        const used = searchParams.get('used');
        const owner = searchParams.get('owner');

        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message: 'Unauthorized'}, {status:401});
        }

        const cached = await getCachedCalendars(user.id, "microsoft");

        if(cached){
            const filteredCachedCalendars = filterCalendarsByParams({calendars: cached, used, owner})
            return NextResponse.json({message:"Successfully fetched calendars", data: filteredCachedCalendars}, {status: 200});
        }
        const rateLimit = await checkCalendarApiLimit(user.id, "microsoft");

        if(!rateLimit.success){
            return NextResponse.json({message: rateLimit.message}, {status:429});
        }



        const accessToken = await getOAuthToken(user.id, "microsoft");
        if(!accessToken){
            return NextResponse.json({message: "Microsoft account not connected. Please reconnect in settings."}, {status: 404});
        }

        const res = await axiosInstance.get("https://graph.microsoft.com/v1.0/me/calendars", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })
        const data = res.data;
        if(!data){
            return NextResponse.json({message:"No calendars found"}, {status: 404});
        }

        const usedCalendarIds = await getUsedCalendarIds(user.id, "microsoft");


        let calendars: ProviderCalendarResponse[] = await Promise.all(
            data.value.map(async (calendar: any) => {
                const accessRole = await getMicrosoftAccessRole({canEdit: calendar.canEdit, owner: calendar.owner.address}, user.id);
                return {
                    providerCalendarId: calendar.id,
                    name: calendar.name,
                    description: calendar.description ?? null,
                    timeZone: calendar.timeZone ?? null,
                    primary: calendar.primary ?? false,
                    accessRole: accessRole,
                    used: usedCalendarIds.includes(calendar.id),
                    provider: "microsoft",
                };
            })
        );

        await setCachedCalendars(user.id, "microsoft", calendars);

        calendars = filterCalendarsByParams({calendars: calendars, used, owner})

        return NextResponse.json({message:"Successfully fetched calendars", data: calendars}, {status: 200});
    }
    catch(error){
        console.error('[Microsoft Calendars API] Error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            statusCode: (error as any)?.response?.status
        });
        return NextResponse.json({message:"Something went wrong"}, {status: 500});
    }
}