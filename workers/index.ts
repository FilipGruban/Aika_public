import emailWorker from './email.worker';
import notificationWorker from './notification.worker';
import eventWorker from './event.worker';
import {flowProducer} from "@/lib/flowProducer";
import syncWorker from "@/workers/sync.worker";

console.log('Workers started');

process.on('SIGTERM', async () => {
    await emailWorker.close();
    await notificationWorker.close();
    await eventWorker.close();
    await syncWorker.close()
    await flowProducer.close();
    process.exit(0);
});