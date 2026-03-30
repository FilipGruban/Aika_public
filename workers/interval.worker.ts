import {Worker} from "bullmq";
import {connection} from "@/lib/redis";
import {scheduleCalendarSync} from "@/lib/sync";
import {syncIntervalQueue} from "@/lib/queues";
import {prisma} from "@/lib/prisma";


const intervalWorker = new Worker<{groupId: string, userId: string}>('interval-sync', async (job) => {
        const group = await prisma.calendarGroup.findUnique({ where: { id: job.data.groupId } });
        if(!group){
            console.log("Deleting interval for ", job.data.groupId);
            const result = await syncIntervalQueue.removeJobScheduler(`auto-sync-${job.data.groupId}`);
            console.log("deleted:", result);
            return { success: false, reason: "Group not found" };
        }

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