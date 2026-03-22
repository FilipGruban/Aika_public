"use server";
import {prisma} from "@/lib/prisma";
import {z} from "zod";
import bcrypt from "bcryptjs";
import {checkPasswordChangeLimit, checkPasswordResetLimit} from "@/lib/rate-limits";
import {emailQueue} from "@/lib/queues";
import {sendPasswordResetEmail} from "@/lib/email";
import {getCurrentUser} from "@/lib/authUser";
import {email} from "zod/v4";
import {changePasswordSchema} from "@/lib/zod";

export async function requestPasswordReset(email: string) {
    try{
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user){
            const rateLimit = await checkPasswordResetLimit(email);

            if (!rateLimit.success) return {success: false, message:rateLimit.message};

            return {success:true, message: "If an account exists with this email, a reset link has been sent"};
        }

        const rateLimit = await checkPasswordResetLimit(email);

        if (!rateLimit.success) {
            return{
                success: false,
                message: rateLimit.message,
                retryAfter: rateLimit.retryAfter
            }
        }

        await emailQueue.add('verify-email',{userId: user.id, email: user.email});

        return {success:true, message: "If an account exists with this email, a reset link has been sent"};
    }
    catch(err){
        console.log(err);
        return {success:false, message: "Something went wrong."};
    }
}


const resetPasswordBackendSchema = z.object({
    password: z.string().min(8).max(32)
});

export async function resetPassword(password: string, userId: string, token: string) {
    try{
        const parsedPassword = resetPasswordBackendSchema.safeParse({password});
        if (!parsedPassword.success){
            return {success:false, message: "Invalid password format."};
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where:{
                token,
            }
        })

        if (!resetToken) {
            return { success: false, message: "Invalid or expired reset token." };
        }

        if (resetToken.userId !== userId) {
            return { success: false, message: "Invalid reset token." };
        }

        if (resetToken.expires.getTime() < Date.now()) {
            await prisma.passwordResetToken.delete({ where: { token } });
            return { success: false, message: "Reset token has expired. Please request a new one." };
        }

        const hashedPassword = await bcrypt.hash(parsedPassword.data.password, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordResetToken.deleteMany({
                where: { userId }
            })
        ]);

        return {success:true, message: "Password reset successfully."};
    }
    catch(error){
        console.error('[Reset Password] Error:', {
            userId,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return { success: false, message: "Failed to reset password. Please try again." };
    }

}


export async function changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    try {
        const user = await getCurrentUser();

        if(!user){
            return {success: false, message: "Unauthorized."};
        }

        const validatedValues = changePasswordSchema.safeParse({password: newPassword, confirmPassword: confirmNewPassword, currentPassword});

        if(!validatedValues.success){
            return {success: false, message: "Invalid password input."};
        }

        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

        if (!dbUser){
            return {success: false, message: "User does not exist."};
        }

        if(!bcrypt.compareSync(currentPassword, dbUser.password)){
            return {success: false, message: "Incorrect current password"};
        }

        const hashedPassword = await bcrypt.hash(validatedValues.data.password, 10);

        const rateLimit = await checkPasswordChangeLimit(dbUser.email);
        if(!rateLimit.success){
            return {success: false, message: rateLimit.message};
        }

        prisma.user.update({
            where: {
                id: user.id,
            },
            data:{
                password: hashedPassword
            }
        })
        return {success:true, message: "Password changed successfully."};
    }
    catch(err){
        return {success: false, message: "Failed to reset password. Please try again."};
    }
}