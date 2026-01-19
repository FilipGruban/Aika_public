import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {addSecondaryCalendarsSchema} from "@/lib/zod";
import {
    getCalendarFromProvider, getCalendarGroup,
    getUsedCalendarIds,
    removeAllFromGroup,
    upsertManyCalendars
} from "@/lib/calendar";
import {ProviderCalendarResponse} from "@/types/calendar";
import {getAllAccounts} from "@/lib/user";
import {revalidatePath} from "next/cache";
import {invalidateCalendarCache} from "@/lib/cache";
import {eventFetchQueue} from "@/lib/queues";


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message:"Unauthorized"},{status: 401});
        }

        const data = addSecondaryCalendarsSchema.safeParse((await req.json()));

        if(!data.success){
            return NextResponse.json({message: "Invalid request"}, {status: 400});
        }

        const {calendars} = data.data;

        const group = await getCalendarGroup(id, user.id);

        if (!group) {
            return NextResponse.json({message: "group not found"}, {status:404});
        }

        const accounts = await getAllAccounts(user.id);

        if (!accounts) {
            return NextResponse.json({message:"no accounts connected"}, {status:404});
        }

        const usedCalendarIds = await getUsedCalendarIds(user.id, undefined, id);

        const results  = await Promise.all(calendars.map( async (calendar) => {
            const res = await getCalendarFromProvider(calendar.provider, calendar.id, user.id);
            if(!res || res.accessRole !== "owner" || usedCalendarIds.includes(res.providerCalendarId)) return;
            return res;
        }))

        const validatedCalendars = results.filter(
            (cal): cal is ProviderCalendarResponse => cal !== undefined
        );

        await removeAllFromGroup(group.id);
        const upsertedCalendars = await upsertManyCalendars(validatedCalendars, user.id, id);

        if(!upsertedCalendars){
            return NextResponse.json({message:"Failed to store calendars in database"}, {status:404});
        }

        await invalidateCalendarCache(user.id);

        revalidatePath(`/dashboard/calendars/groups/${id}`);

        await eventFetchQueue.addBulk(upsertedCalendars.map((calendar)=>(
            {name: 'fetch-calendar-events',
                data: {
                    provider: calendar.provider,
                    providerCalendarId: calendar.providerCalendarId,
                    userId: user.id,
                    calendarId: calendar.id
                },
                opts:{
                    attempts: 5,
                    backoff: {
                        type: "exponential",
                        delay: 5000
                    }
                }
            }
        ))
        )

        return NextResponse.json({message:"Successfully updated calendars"}, {status:200});
    }
    catch(e) {
        console.error(e);
        return NextResponse.json({message: "Something went wrong"}, {status:500});
    }
}