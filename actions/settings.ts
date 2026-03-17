"use server"

import {CalendarGroupSettingsInput, calendarGroupSettingsSchema} from "@/lib/zod";
import {getCurrentUser} from "@/lib/authUser";
import {getCalendarGroup} from "@/lib/calendar";
import {prisma} from "@/lib/prisma";
import {syncIntervalQueue} from "@/lib/queues";

export async function saveSettings(settings : CalendarGroupSettingsInput, groupId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return {success: false, message:"Unauthorized"};
        }

        const validatedSettings = calendarGroupSettingsSchema.safeParse(settings);

        if (!validatedSettings.success) {
            return {success: false, message:"Invalid settings"};
        }

        const group = await getCalendarGroup(groupId, user.id);

        if (!group) {
            return {success: false, message:"Group not found"};
        }

        const newSettings = await prisma.calendarGroupSettings.update({
            where: {
                groupId: group.id,
            },
            data:{
                ...settings,
            }
        })

        await syncIntervalQueue.upsertJobScheduler(
            `auto-sync-${group.id}`,
            {
                every: (Number(newSettings.syncFrequencyMinutes) || 60) * 60 * 1000,
                startDate: new Date(Date.now() + (Number(newSettings.syncFrequencyMinutes) || 60) * 60 * 1000),
            },
            {
                name: 'trigger-sync',
                data: {
                    groupId: group.id,
                    userId: user.id,
                },
            })

        return {success: true, message:"Successfully updated group settings"};
    }
    catch (error) {
        console.error(error);
        return {success: false, message:"Something went wrong"};
    }
}