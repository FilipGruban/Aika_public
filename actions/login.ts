"use server"
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {SignInInput} from "@/lib/zod";
import {sendVerificationEmail} from "@/lib/email";
import {getUserByEmail} from "@/lib/user";

export async function login(credentials : SignInInput) {
    try{

        const user = await getUserByEmail(credentials.email);
        if (!user) {
            return { success: false, message: "Invalid email or password." };
        }

        if (!user.emailVerified) {
            await sendVerificationEmail(user.id, user.email);
            return { success: false, message: "Please verify your email." };
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