import {Worker} from "bullmq";
import {connection} from "@/lib/redis";
import {scheduleCalendarSync} from "@/lib/sync";


const intervalWorker = new Worker<{groupId: string, userId: string}>('interval-sync', async (job) => {
        await scheduleCalendarSync(job.data.groupId, job.data.userId, "automatic");
        return {success: true};
    },
    {
        connection
    })


intervalWorker.on('completed', (job) => {
    console.log(`${job.id} completed`);
})

intervalWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
})

export default intervalWorker;