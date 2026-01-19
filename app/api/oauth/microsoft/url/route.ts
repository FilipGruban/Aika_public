import {generateCsrfToken} from "@/lib/oauth/csrf";
import {NextResponse} from "next/server";

export async function GET() {
    const state = await generateCsrfToken();
    try {
        const params = new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
            response_type: "code",
            scope: [
                "openid",
                "profile",
                "email",
                "offline_access",
                "User.Read",
                "Calendars.ReadWrite",
                "Calendars.ReadWrite.Shared",
            ].join(" "),
            response_mode: "query",
            state,
        });

        const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
        return NextResponse.json({url}, {status: 200});
    }
    catch (error) {
        return NextResponse.json({message:"Something went wrong while creating microsoft auth url."}, {status: 400});
    }

}
