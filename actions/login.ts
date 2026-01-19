"use server"
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {SignInInput} from "@/lib/zod";
import {getUserByEmail} from "@/lib/user";
import {emailQueue} from "@/lib/queues";
import {checkEmailVerificationLimit} from "@/lib/rate-limits";

export async function login(credentials : SignInInput) {
    try{
        const user = await getUserByEmail(credentials.email);
        if (!user) {
            return { success: false, message: "Invalid email or password." };
        }

        if (!user.emailVerified) {

            const rateLimit = await checkEmailVerificationLimit(credentials.email);

            if (!rateLimit.success) {
                return{
                    success: false,
                    message: rateLimit.message,
                    retryAfter: rateLimit.retryAfter
                }
            }

            await emailQueue.add('verify-email', { userId: user.id, email: user.email });

            return {
                success: false,
                message: "Please verify your email. We've sent you a verification link."
            };
        }


        await signIn("credentials", {
            email: credentials.email,
            password: credentials.password,
            redirectTo: "/dashboard"
        });
    }
    catch(error){
        if(error instanceof AuthError){
            switch(error.type){
                case 'CredentialsSignin':
                    return { success: false, message: "Invalid email or password." };
                default:
                    return { success: false, message: "Authentication failed." };
            }
        }
        throw error;
    }
}