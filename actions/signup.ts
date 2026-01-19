"use server"
import {SignUpInput, signUpSchema} from "@/lib/zod"
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {emailQueue} from "@/lib/queues";

export async function signUp(credentials : SignUpInput){
    const validatedCredentials = signUpSchema.safeParse(credentials);

    if(!validatedCredentials.success){
        return {success:false, message:"Invalid input."};
    }

    const {name, email, password } = validatedCredentials.data;

    try{

    const existingUserEmail = await prisma.user.findUnique({where:{email}});

    if(existingUserEmail){
        return {success:false, message:"User with this email address already exists."};
    }

    const hashedPassword = await bcrypt.hash(password, 10);


        const user = await prisma.user.create({
            data:{
                name,
                email,
                password :hashedPassword,
            }
        });

        await emailQueue.add('verify-email', {userId: user.id, email: user.email});

        return { success: true, message:"User successfully created. We have send you verification email."};
    }
    catch(err){
        console.error("Prisma error during user creation:", err);
        return {success: false, message:"Something went wrong."};
    }
}