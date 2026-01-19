import {getCurrentUser} from "@/lib/authUser";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";


export async function GET(){
    const user = await getCurrentUser()

    if (!user){
        return NextResponse.json({message: 'Unauthorized'}, {status:401});
    }

    const notifications = await prisma.notification.findMany({
        where: {userId: user.id},
        orderBy: {createdAt: 'desc'},
        take: 5
    })

    return NextResponse.json({message:"Successfully fetched notifications", data: notifications, status: 200});
}