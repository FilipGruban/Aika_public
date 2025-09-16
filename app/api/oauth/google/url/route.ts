import {generateCsrfToken} from "@/lib/oauth/csrf";
import {NextResponse} from "next/server";

export async function GET() {
    const state = await generateCsrfToken();
    try {
        const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            response_type: "code",
            scope: [
                "openid",
                "email",
                "profile",
                "https://www.googleapis.com/auth/calendar",
            ].join(" "),
            state,
            access_type: "offline",
            prompt: "consent",
        });

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        return NextResponse.json({url}, {status: 200});
    }
    catch (error) {
        return NextResponse.json({message:"Something went wrong while creating google auth url."}, {status: 400});
    }

}
