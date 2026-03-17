"use server"

import {getCurrentUser} from "@/lib/authUser";
import {scheduleCalendarSync} from "@/lib/sync";
import {checkManualSyncLimit} from "@/lib/rate-limits";
import {getCalendarGroup} from "@/lib/calendar";

export async function triggerSync(groupId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return {success: false, message: "User not logged in"};
        }

        const group = await getCalendarGroup(groupId, user.id);

        if (!group || !group.settings?.syncEnabled) {
            return {success: false, message: "Enable sync in settings to synchronize"};
        }

        const rateLimit = await checkManualSyncLimit(user.id)

        if (!rateLimit.success) {
            return{
                success: false,
                message: rateLimit.message,
                retryAfter: rateLimit.retryAfter
            }
        }

        await scheduleCalendarSync(groupId, user.id, "manual");

        return {success: true, message: "Calendar group scheduled for synchronization"};
    }
    catch(e) {
        console.error(e);
        return {success: false, message:"Failed to synchronize calendar group"};
    }

}