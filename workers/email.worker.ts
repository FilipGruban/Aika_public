import {Worker} from 'bullmq';
import {connection} from '@/lib/redis';
import {sendPasswordResetEmail, sendVerificationEmail} from "@/lib/email";

const emailWorker = new Worker<{userId:string, email:string}>(
    'email',
    async (job)=> {
        switch (job.name){
            case 'verify-email':
                await sendVerificationEmail(job.data.userId, job.data.email);
                return {success:true};
            case 'password-reset':
                await sendPasswordResetEmail(job.data.userId, job.data.email);
                return {success:true};
        }
    },
    {
        connection,
        concurrency: 5
    }
);

emailWorker.on('completed', (job) => {
    console.log(`${job.id} completed`);
})

emailWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
})

export default emailWorker;
