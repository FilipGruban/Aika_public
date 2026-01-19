"use server"
import {Provider} from "@prisma/client";
import {getCurrentUser} from "@/lib/authUser";
import {prisma} from "@/lib/prisma";
import {revalidatePath} from "next/cache";
import {invalidateCalendarCache} from "@/lib/cache";
import {notificationQueue} from "@/lib/queues";

export async function unlinkProvider(provider: Provider){
    const user = await getCurrentUser();
    if (!user) {
        return {success: false, message: "Not authenticated."};
    }
    try{
        await prisma.$transaction([
            prisma.calendarGroup.deleteMany({
                where: {
                    userId: user.id,
                    primaryCalendar: {
                        provider
                    }
                }
            }),
            prisma.calendar.deleteMany({
                where: {
                    provider,
                    userId: user.id,
                }
            }),
            prisma.account.deleteMany({
                where: {
                    userId: user.id,
                    provider: provider,
                }
            })
        ])
        await invalidateCalendarCache(user.id, provider);
        revalidatePath("/dashboard/settings/providers")

        await notificationQueue.add('unlink-provider-notification',{
            userId: user.id,
            title: `${provider} unlinked`,
            message: `Your ${provider} account is no longer connected`,
            type: "alert"
        })

        return { success: true, message: 'Provider unlinked successfully' };
    }
    catch(error){
        console.error(error);
        return { success: false, message: 'Failed to unlink provider' };
    }
}