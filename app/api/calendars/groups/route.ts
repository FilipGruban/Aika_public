import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {createCalendarGroupSchema} from "@/lib/zod";
import {getCalendarById, getCalendarFromProvider, upsertCalendar} from "@/lib/calendar";
import {prisma} from "@/lib/prisma";
import {getAccount} from "@/lib/user";
import {revalidatePath} from "next/cache";
import {invalidateCalendarCache} from "@/lib/cache";
import {eventFetchQueue, notificationQueue, syncIntervalQueue} from "@/lib/queues";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const data = createCalendarGroupSchema.safeParse((await req.json()));

        if (!data.success) {
            return NextResponse.json({message: "Invalid request"}, {status: 400});
        }

        const validatedData = data.data;

        if (!validatedData.provider) {
            return NextResponse.json({message: "Invalid provider"}, {status: 400});
        }
        const account = await getAccount(user.id, validatedData.provider);

        if (!account) {
            return NextResponse.json({message: `${validatedData.provider} not connected`}, {status: 400});
        }

        const existingCalendar = await getCalendarById(validatedData.mainCalendarId, user.id);

        const isPrimary = await prisma.calendarGroup.findFirst({
            where: {
                primaryCalendarId: existingCalendar?.id
            }
        });

        if (existingCalendar && (existingCalendar.groupId || isPrimary)) {
            return NextResponse.json({message: "Calendar already at use in different group"}, {status: 400});
        }

        const calendar = await getCalendarFromProvider(validatedData.provider, validatedData.mainCalendarId, user.id);

        if (!calendar) {
            return NextResponse.json({message: "Failed to get calendar from provider"}, {status: 400})
        }

        const dbCalendar = await upsertCalendar(calendar, account.id, user.id, validatedData.provider);

        if (!dbCalendar) {
            return NextResponse.json({message: "Failed to save calendar in database"}, {status: 400})
        }

        const group = await prisma.calendarGroup.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                userId: user.id,
                primaryCalendarId: dbCalendar.id,
                settings: {
                    create: {}
                }
            },
            include: {
                settings: true
            }
        })


        await invalidateCalendarCache(user.id);

        revalidatePath('/dashboard/calendars/groups')

        await eventFetchQueue.add('fetch-events', {
            provider: dbCalendar.provider,
            providerCalendarId: dbCalendar.providerCalendarId,
            userId: user.id,
            calendarId: dbCalendar.id
        }, {
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 5000
            }
        });

        await notificationQueue.add('group-created-notification', {
            userId: user.id,
            title: `Calendar group ${group.name} created`,
            message: `You have created new calendar group called ${group.name}`,
            type: "alert"
        })

        await syncIntervalQueue.upsertJobScheduler(
            `auto-sync-${group.id}`,
            {
                every: (Number(group.settings?.syncFrequencyMinutes) || 60) * 60 * 1000,
                startDate: new Date(Date.now() + (Number(group.settings?.syncFrequencyMinutes) || 60) * 60 * 1000),
            },
            {
                name: 'trigger-sync',
                data: {
                    groupId: group.id,
                    userId: user.id,
                },
            }
        );

        return NextResponse.json({message: "Successfully created calendar group", groupId: group.id}, {status: 201,});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}