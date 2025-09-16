import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {getAccount} from "@/lib/user";
import {cookies} from "next/headers";
import axiosInstance from "@/lib/axios";
import {prisma} from "@/lib/prisma";
import {saveToken} from "@/lib/tokens";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();

    if(!user){
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const account = await getAccount(user.id, "microsoft")

    if(account){
        return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Microsoft+account+already+connected", req.url));
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const savedState = (await cookies()).get("oauth_state")?.value;
    if (!code || !state || state !== savedState) {
        return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Invalid+csrf+token", req.url));
    }

    try {
        const tokenRes = await axiosInstance.post("https://login.microsoftonline.com/common/oauth2/v2.0/token",
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.MICROSOFT_CLIENT_ID!,
                client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
                redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        )
        const tokenData = tokenRes.data;

        const requiredScopes = [
            "Calendars.ReadWrite",
            "openid",
            "Calendars.ReadWrite.Shared",
            "email",
            "profile",
            "User.Read"
        ];
        const granted = new Set(tokenData.scope.split(" "))

        if(!requiredScopes.every(scope => granted.has(scope))){
            return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Permisions+not+granted", req.url));
        }


        const userRes = await axiosInstance.get("https://graph.microsoft.com/v1.0/me",{
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        })
        const userData = userRes.data;

        const connectedAccount = await prisma.account.findUnique({
            where: {
                providerUserId: userData.id,
                provider: "microsoft"
            }
        })

        if(connectedAccount){
            return NextResponse.redirect(new URL("/dashboard/settings/providers?error=This+account+is+already+connected+to+a+different+user", req.url));
        }

        await saveToken({
            username: userData.displayName,
            accessToken: tokenData.access_token,
            providerUserId: userData.id,
            refreshToken:tokenData.refresh_token,
            userId:user.id,
            expiresIn:tokenData.expires_in,
            provider:"microsoft"
        })

        return NextResponse.redirect(new URL("/dashboard/settings/providers?connected=Microsoft+account+successfully+connected", req.url));
    }
    catch(error){
        console.error(error);
        return NextResponse.redirect(new URL("/dashboard/settings/providers?error=Something+went+wrong", req.url));
    }

}