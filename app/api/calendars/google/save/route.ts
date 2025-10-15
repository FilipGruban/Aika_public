import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {getAccount} from "@/lib/user";
import {prisma} from "@/lib/prisma";


export async function POST(req : NextRequest){
    try {
        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message: "Unauthorized"}, {status:403});
        }

        const account = await getAccount(user.id, "google");
        if(!account){
            return NextResponse.json({message:"Google account not found"}, {status:400})
        }
        const {calendars} = await req.json();

        if(!calendars){
            return NextResponse.json({message:"Missing calendars"}, {status:400})
        }

        const existingCalendars = await prisma.calendar.findMany({
            where: {
                account:{
                    userId: user.id,
                    provider: "google"
                }
            },
            select: {
                id: true,
                providerCalendarId: true,
                name: true,
                selected: true,
                accessRole: true,
            },
        });


    }
    catch(err){
        console.log(err);
        return NextResponse.json({message:"Something went wrong"}, {status:500});
    }
}