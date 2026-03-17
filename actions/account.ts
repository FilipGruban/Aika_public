"use server"

import {getCurrentUser} from "@/lib/authUser";
import {updateProfileSchema, UpdateProfileType} from "@/lib/zod";
import {prisma} from "@/lib/prisma";
import {checkAccountUpdateLimit} from "@/lib/rate-limits";

export async function updateAccount(updatedUser: UpdateProfileType){
    try {
        const user = await getCurrentUser();
        if (!user) {
            return {success: false, message: "Not authenticated."};
        }

        const validatedInput = updateProfileSchema.safeParse(updatedUser);

        if (!validatedInput.success) {
            return {success: false, message: "Invalid input."};
        }

        const rateLimit = await checkAccountUpdateLimit(user.id);
        if(!rateLimit.success){
            return {success: false, message: rateLimit.message};
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                ...validatedInput.data,
            }
        })


        return {success: true, message: "Account updated successfully."};
    }
    catch (error) {
        return {success: false, message: "Something went wrong."};
    }
}