"use server";
import {prisma} from "@/lib/prisma";
import {z} from "zod";
import bcrypt from "bcryptjs";
import {checkPasswordResetLimit} from "@/lib/rate-limits";
import {emailQueue} from "@/lib/queues";
import {sendPasswordResetEmail} from "@/lib/email";

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