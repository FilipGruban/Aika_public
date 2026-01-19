import { Queue } from 'bullmq';
import {connection} from './redis'

export const calendarSyncQueue = new Queue('calendar-sync', { connection });
export const eventFetchQueue = new Queue('fetch-events', { connection });
export const emailQueue = new Queue('email', { connection });
export const notificationQueue = new Queue('notification', { connection });
export const webhookQueue = new Queue('webhook', { connection });
export const cleanupQueue = new Queue('cleanup', { connection });