import {getCurrentUser} from "@/lib/authUser";
import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import axiosInstance from "@/lib/axios";
import {getAccount} from "@/lib/user";
import {saveToken} from "@/lib/tokens";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    
    if(!user){
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const account = await getAccount(user.id, "google")

    if(account){
        return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Google+account+already+connected", req.url));
    }
    
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const savedState = (await cookies()).get("oauth_state")?.value;
    if (!code || !state || state !== savedState) {
        return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Invalid+csrf+token", req.url));
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
            return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Permisions+not+granted", req.url));
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
            return NextResponse.redirect(new URL("/dashboard/settings/providers?error=This+account+is+already+connected+to+a+different+user", req.url));
        }

        await saveToken({
            username: userData.name,
            accessToken: tokenData.access_token,
            providerUserId: userData.sub,
            refreshToken:tokenData.refresh_token,
            userId:user.id,
            expiresIn:tokenData.expires_in,
            provider:"google"
        })

        return NextResponse.redirect(new URL("/dashboard/settings/providers?connected=Google+account+successfully+connected", req.url));
    }
    catch(error){
        console.error(error);
        return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Something+went+wrong", req.url));
    }

}