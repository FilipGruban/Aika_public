import {Worker} from "bullmq";
import {createNotification} from "@/lib/notifications";
import {NotificationType} from "@prisma/client";
import {connection} from "@/lib/redis";

const notificationWorker = new Worker<{
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
}>(
    "notification",
    async(job)  =>{
        await createNotification({userId: job.data.userId, type: job.data.type, title: job.data.title, message: job.data.message, link: job.data.link });
    },
    {
        connection,
        concurrency: 10,
    }
);

notificationWorker.on('completed', (job) => {
    console.log(`${job.id} completed`);
})

notificationWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
})

export default notificationWorker;