import {Worker} from 'bullmq'
import {Provider} from "@prisma/client";
import {getAppleCalendarEvents, getGoogleCalendarEvents, getMicrosoftCalendarEvents} from "@/lib/event";
import {connection} from "@/lib/redis";
import {EventDTO} from "@/types/event";
import {prisma} from "@/lib/prisma";

const eventWorker = new Worker<{ provider: Provider, providerCalendarId: string, userId: string, calendarId: string }>(
    'fetch-events',
    async (job) => {
    try {
        let events: EventDTO[] | null = null;
        switch (job.data.provider) {
            case "google":
                events = await getGoogleCalendarEvents(job.data.userId, job.data.providerCalendarId);
                break;
            case "microsoft":
                events = await getMicrosoftCalendarEvents(job.data.userId, job.data.providerCalendarId);
                break;
            case "apple":
                events = await getAppleCalendarEvents(job.data.userId, job.data.providerCalendarId);
                break;
        }

        if (events === null) {
            throw new Error(`Failed to fetch events from ${job.data.provider}`);
        }

        const externalIds = events.map(e => e.providerEventId);

        await prisma.$transaction([
            prisma.event.deleteMany({
                where: {
                    userId: job.data.userId,
                    provider: job.data.provider,
                    calendarId: job.data.calendarId,
                    externalId: {
                        notIn: externalIds,
                    },
                },
            }),
            ...events.map(event =>(
                prisma.event.upsert({
                    where: {
                        userId_provider_externalId: {
                            userId: job.data.userId,
                            provider: job.data.provider,
                            externalId: event.providerEventId,
                        }
                    },
                    update: {
                        title: event.title || 'Untitled',
                        description: event.description?.substring(0, 100) || null,
                        start: new Date(event.startTime),
                        end: new Date(event.endTime),
                        location: event.location,
                        status: event.status,
                        isAllDay: event.isAllDay,
                        calendarId: job.data.calendarId,
                        recurrenceRule: event.recurrenceRule,
                    },
                    create: {
                        userId: job.data.userId,
                        providerCalendarId: job.data.providerCalendarId,
                        provider: job.data.provider,
                        externalId: event.providerEventId,
                        title: event.title || 'Untitled',
                        description: event.description?.substring(0, 100) || null,
                        start: new Date(event.startTime),
                        end: new Date(event.endTime),
                        location: event.location,
                        status: event.status,
                        isAllDay: event.isAllDay,
                        calendarId: job.data.calendarId,
                        recurrenceRule: event.recurrenceRule,
                    }
                })
            ))
        ]);

        return {success: true, eventCount: events.length};
    } catch (error) {
        console.error(`Failed to fetch events for ${job.data.provider}:`, error);

        return {
            success: false,
            eventCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: job.data.provider
        };
    }

    },
    {
        connection,
        concurrency: 3
    }
)

eventWorker.on('ready', () => {
    console.log(`Ready ${process.env.REDIS_URI}`);
})

eventWorker.on('completed', (job) => {
    console.log(`${job.id} completed`);
})

eventWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
})

export default eventWorker;