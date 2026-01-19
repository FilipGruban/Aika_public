"use server"

import {prisma} from "@/lib/prisma";
import {getCurrentUser} from "@/lib/authUser";

export async function markNotificationRead(notificationId:string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {success: false, message: 'Not logged in'};
        }

        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                userId: user.id,
            },
            data: {
                read: true,
                seenAt: new Date(),
            }
        })

        return {success: true, message: 'Succesfully marked as read'};
    }
    catch(error){
        console.error(error);
        return {success: false, message: 'Error marking notification read'};
    }
}