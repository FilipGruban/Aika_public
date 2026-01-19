import { getCurrentUser } from "@/lib/authUser";
import axiosInstance from "@/lib/axios";
import { encrypt } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { saveToken } from "@/lib/tokens";
import { getAccount } from "@/lib/user";
import { appleIdSchema } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import {notificationQueue} from "@/lib/queues";

export async function POST(req: NextRequest){
    const user = await getCurrentUser()
    if(!user || !user.emailVerified){
        return NextResponse.json({message:"Unauthorized"}, {status:403})
    }

    const connectedAccount = await getAccount(user.id, "apple");
    if(connectedAccount){
        return NextResponse.json({message:"Apple account already connected"}, {status:400});
    }

    const existingConnection = await prisma.account.findUnique({
        where: {
            providerUserId: user.email,
            provider: "apple"
        }
    })

    if(existingConnection){
        return NextResponse.json({message:"This account is already connected to different user"}, {status:400});
    }

    const { credentials } = await req.json()
    const parsedCredentials = appleIdSchema.safeParse(credentials);

    if(!parsedCredentials.success){
        return NextResponse.json({message:"Invalid request"}, {status:400})
    }
    const validatedCredentials = parsedCredentials.data;
    try{
        const response = await axiosInstance.request({
            method: "PROPFIND",
            url:"https://caldav.icloud.com/",
            auth:{
                username: validatedCredentials.email,
                password: validatedCredentials.password,
            },
        })
        if(response.status !== 200 && response.status !== 207){
            return NextResponse.json({message:"Authentication failed, invalid credentials"}, {status:400});
        }

        const encryptedPassword = encrypt(validatedCredentials.password);

        await saveToken({
            userId: user.id,
            provider: "apple",
            providerUserId: validatedCredentials.email,
            credential: encryptedPassword,
            providerEmail: validatedCredentials.email
        })

        await notificationQueue.add('apple-connected-notification',{userId: user.id, type: "alert", title: "Apple account connected", message:"You have successfully conected your apple account."})

        return NextResponse.json({message:"Successfully connected apple account"}, {status:200});
    }
    catch (err){
        console.log(err)
        return NextResponse.json({message:"Something went wrong"}, {status:400})
    }

}