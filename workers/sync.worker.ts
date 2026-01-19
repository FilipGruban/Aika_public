import {Worker} from "bullmq";
import {connection} from "@/lib/redis";
import {syncCalendarGroup} from "@/lib/sync";


const syncWorker = new Worker<{groupId: string, userId: string}>('calendar-sync', async (job) => {

        await syncCalendarGroup(job.data.groupId, job.data.userId);

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