import {Worker} from "bullmq";
import {connection} from "@/lib/redis";
import {syncCalendarGroup} from "@/lib/sync";
import {prisma} from "@/lib/prisma";


const syncWorker = new Worker<{ groupId: string, userId: string, syncLogId: string }>('calendar-sync', async (job) => {
        try {

            const childrenValues = await job.getChildrenValues();
            const failures = Object.entries(childrenValues).filter(([key, value]: [string, any]) => value?.success === false);

            if (failures.length > 0) {
                const errorMessages = failures.map(([key, value]: [string, any]) => `${value.provider}: ${value.error}`).join('; ');

                await prisma.syncLog.update({
                    where: {id: job.data.syncLogId},
                    data: {
                        status: "failed",
                        error: `Failed to fetch events: ${errorMessages}`,
                    }
                });

                return {success: false, error: errorMessages};
            }

            await syncCalendarGroup(job.data.groupId, job.data.userId, job.data.syncLogId);
        } catch (e) {
            console.error(e);
            await prisma.syncLog.update({
                where: {id: job.data.syncLogId},
                data: {
                    status: "failed",
                }
            });
            throw e
        }
        return {success: true};
    },
    {
        connection
    })


syncWorker.on('completed', (job) => {
    console.log(`${job.id} completed`);
})

syncWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
})

export default syncWorker;