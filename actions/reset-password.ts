"use server";
import {prisma} from "@/lib/prisma";
import {sendPasswordResetEmail} from "@/lib/email";
import {z} from "zod";
import bcrypt from "bcryptjs";
import {redirect} from "next/navigation";

export async function requestPasswordReset(email: string) {
    try{
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user){
            return {success:true, message: "If an account exists with this email, a reset link has been sent"};
        }

        await sendPasswordResetEmail(user.id, user.email);
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
            return {success:false, message: "Invalid input"};
        }
        const newPassword = parsedPassword.data.password;

        const resetToken = await prisma.passwordResetToken.findUnique({
            where:{
                token,
            }
        })

        if(!resetToken || resetToken.userId !== userId){
            return {success:false, message: "Invalid reset token."};
        }

        if(resetToken.expires.getTime() < Date.now()){
            return {success:false, message: "Expired reset token."};
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where:{
                id: userId,
            },
            data: {
                password: hashedPassword,
            }
        })

        await prisma.passwordResetToken.delete({
            where:{
                token,
            }
        })
        return {success:true, message: "Password reset successfully."};
    }
    catch(error){
        console.log(error);
        return {success:false, message: "Something went wrong."};
    }

}