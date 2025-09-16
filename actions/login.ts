"use server"
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {SignInInput} from "@/lib/zod";

//server action pro prihlaseni
export async function login(credentials : SignInInput) {
    try{
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