import {getCurrentUser} from "@/lib/authUser";
import {NextRequest, NextResponse} from "next/server";
import axiosInstance from "@/lib/axios";
import {getAccount} from "@/lib/user";
import {saveToken} from "@/lib/tokens";
import {prisma} from "@/lib/prisma";
import {verifyCsrfToken} from "@/lib/oauth/csrf";
import {notificationQueue} from "@/lib/queues";
import {appUrl} from "@/lib/url";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    
    if(!user || !user.emailVerified){
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const account = await getAccount(user.id, "google")

    if(account){
            return NextResponse.redirect(appUrl("/dashboard/settings/providers?error=Google+account+already+connected"));
    }
    
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const csrfVerification = await verifyCsrfToken(state)

    if (!code || !csrfVerification) {
        return NextResponse.redirect(appUrl("/dashboard/settings/providers?error=Invalid+csrf+token"));
    }

    try {
        const tokenRes = await axiosInstance.post("https://oauth2.googleapis.com/token",
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        )
        const tokenData = tokenRes.data;

        const requiredScopes = [
            "https://www.googleapis.com/auth/calendar",
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ];
        const granted = new Set(tokenData.scope.split(" "))

        if(!requiredScopes.every(scope => granted.has(scope))){
            return NextResponse.redirect(appUrl("/dashboard/settings/providers?error=Permisions+not+granted"));
        }


        const userRes = await axiosInstance.get("https://openidconnect.googleapis.com/v1/userinfo",{
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        })
        const userData = userRes.data;
        const connectedAccount = await prisma.account.findUnique({
            where: {
                providerUserId: userData.sub,
                provider: "google"
            }
        })

        if(connectedAccount){
            return NextResponse.redirect(appUrl("/dashboard/settings/providers?error=This+account+is+already+connected+to+a+different+user"));
        }
        
        await saveToken({
            accessToken: tokenData.access_token,
            providerUserId: userData.sub,
            refreshToken:tokenData.refresh_token,
            userId:user.id,
            expiresIn:tokenData.expires_in,
            provider:"google",
            providerEmail: userData.email
        })

        await notificationQueue.add('google-connected-notification',{userId: user.id, type: "alert", title: "Google account connected", message:"You have successfully conected your google account."})

        return NextResponse.redirect(appUrl("/dashboard/settings/providers?success=Google+account+successfully+connected"));
    }
    catch(error){
        console.error(error);
        return NextResponse.redirect(appUrl("/dashboard/settings/providers?error=Something+went+wrong"));
    }

}