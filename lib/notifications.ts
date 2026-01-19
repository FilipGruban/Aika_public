import {NotificationType} from '@prisma/client'
import {prisma} from "@/lib/prisma";

export async function createNotification({userId, type, title, message, link }:{userId: string, type: NotificationType, title: string, message: string, link?: string}) {
    try {
        return await prisma.notification.create({
            data:{
                userId,
                type,
                title,
                message,
                link,
            }
        });
    }
    catch (e) {
        console.error(e);
        return null;
    }
}