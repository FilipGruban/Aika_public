import {getCurrentUser} from "@/lib/authUser";
import {NextResponse} from "next/server";
import {getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";

export async function GET(){
    try{
        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message: 'Unauthorized'}, {status:401});
        }

        const accessToken = await getOAuthToken(user.id, "google");

        if(!accessToken){
            return NextResponse.json({message: "Invalid access token"}, {status: 400});
        }

        const res = await axiosInstance.get("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })
        const data = res.data;
        if(!data){
            return NextResponse.json({message:"Failed to get calendars"}, {status: 400});
        }


        const calendars = data.items.map((item:any) => ({
            id: item.id,
            name: item.summary,
            description: item.description ?? null,
            timeZone: item.timeZone ?? null,
            primary: item.primary ?? false,
            accessRole: item.accessRole,
            selected: false,
        }));

        return NextResponse.json({message:"Successfully fetched calendars", data: calendars}, {status: 200});

    }
    catch(error){
        console.log(error);
        return NextResponse.json({message:"Something went wrong"}, {status: 500});
    }
}