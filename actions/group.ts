"use server"

import {getCurrentUser} from "@/lib/authUser";
import {revalidatePath} from "next/cache";
import {prisma} from "@/lib/prisma";
import {invalidateCalendarCache} from "@/lib/cache";
import {syncIntervalQueue, notificationQueue} from "@/lib/queues";

export async function deteleCalendarGroup(calendarGroupId: string){
    try {
        const user = await getCurrentUser();
        if (!user) {
            return {success: false, message: "Not authenticated."};
        }

        const group = await prisma.calendarGroup.delete({
            where: {
                id: calendarGroupId,
                userId: user.id,
            }
        })

        if (!group) {
            return {success: false, message: "Failed to find group."};
        }

        await invalidateCalendarCache(user.id);

        revalidatePath('/dashboard/calendars/groups')

        await notificationQueue.add('delete-group-notification', {userId: user.id, type: "alert", message:`You have deleted ${group.name} group`, title:"Calendar group deleted"})
        await syncIntervalQueue.removeJobScheduler(`auto-sync-${group.id}`)
        return {success: true, message: "Groups successfully deleted."};
    }
    catch (error) {
        console.error(error);
        return {success: false, message: "Failed to delete calendar group"};
    }
}