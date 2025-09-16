"use server"
import {SignUpInput, signUpSchema} from "@/lib/zod"
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signUp(credentials : SignUpInput){
    const validatedCredentials = signUpSchema.safeParse(credentials);

    if(!validatedCredentials.success){
        return {success:false, message:"Invalid input"};
    }

    const {name, email, password } = validatedCredentials.data;

    const existingUserEmail = await prisma.user.findUnique({where:{email}});

    if(existingUserEmail){
        return {success:false, message:"User with this email address already exists"};
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try{
        await prisma.user.create({
            data:{
                name,
                email,
                password :hashedPassword,
            }
        });
        return { success: true, message:"User successfully created"};
    }
    catch(err){
        console.error("Prisma error during user creation:", err);
        return {success: false, message:"Something went wrong"};
    }
}