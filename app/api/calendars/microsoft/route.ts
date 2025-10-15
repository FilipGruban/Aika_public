import {getCurrentUser} from "@/lib/authUser";
import {NextResponse} from "next/server";
import {getOAuthToken} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {getAccount} from "@/lib/user";

export async function GET(){
    try{
        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message: 'Unauthorized'}, {status:401});
        }

        const accessToken = await getOAuthToken(user.id, "microsoft");

        if(!accessToken){
            return NextResponse.json({message: "Invalid access token"}, {status: 400});
        }

        const res = await axiosInstance.get("https://graph.microsoft.com/v1.0/me/calendars", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })
        const data = res.data;
        if(!data){
            return NextResponse.json({message:"Failed to get calendars"}, {status: 400});
        }

        const account = await getAccount(user.id, "microsoft");

        if(!account){
            return NextResponse.json({message:"Failed to get microsoft account"}, {status: 400})
        }

        const calendars = data.value.map((item:any) => ({
            id: item.id,
            name: item.name,
            description: null,
            timeZone: null,
            primary: item.isDefaultCalendar ?? false,
            accessRole:  !item.canEdit ? "reader" : item.owner.address === account.providerEmail ? "owner" : "writer",
            selected: false,
        }));

        return NextResponse.json({message:"Successfully fetched calendars", data: calendars}, {status: 200});
    }
    catch(err){
        console.log(err);
        return NextResponse.json({message:"Something went wrong"}, {status: 500});
    }
}