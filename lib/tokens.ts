import {Provider} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import axiosInstance from "@/lib/axios";
import {getAccount} from "@/lib/user";

interface TokenType {
    refreshToken?: string;
    accessToken?: string;
    expiresIn?: number;
    userId: string;
    providerUserId: string;
    provider: Provider;
    credential?: string;
    providerEmail: string;
}

export async function saveToken({
                                    refreshToken,
                                    accessToken,
                                    expiresIn,
                                    userId,
                                    providerUserId,
                                    provider,
                                    credential,
                                    providerEmail,
                                }: TokenType) {
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    await prisma.account.create({
        data: {
            userId,
            providerUserId,
            provider,
            credential,
            accessToken,
            refreshToken,
            expiresIn: expiresAt,
            providerEmail
        }
    })
}

export async function refreshGoogleToken(refreshToken: string, userId: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    try {

        const res = await axiosInstance.post("https://oauth2.googleapis.com/token", {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )

        const data = res.data;
        const expiresIn = new Date(Date.now() + data.expires_in * 1000);

        await prisma.account.update({
            where: {
                UserWithProvider: {
                    userId,
                    provider: "google",
                }
            },
            data: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn,
            }
        })

        return data.access_token;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function refreshMicrosoftToken(refreshToken: string, userId: string) {
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;

    try {
        const res = await axiosInstance.post("https://login.microsoftonline.com/common/oauth2/v2.0/token",
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
                scope: [
                    "openid",
                    "profile",
                    "email",
                    "offline_access",
                    "User.Read",
                    "Calendars.ReadWrite",
                    "Calendars.ReadWrite.Shared"
                ].join(" ")
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        )

        const data = res.data;
        const expiresIn = new Date(Date.now() + data.expires_in * 1000);

        await prisma.account.update({
            where: {
                UserWithProvider: {
                    userId,
                    provider: "microsoft",
                }
            },
            data: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn,
            }
        })

        return data.access_token;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to refresh token");
    }
}


export async function getOAuthToken(userId: string, provider: Provider) {
    try {
        const account = await getAccount(userId, provider);

        if (!account || !account.accessToken || !account.refreshToken || !account.expiresIn) {
            return null;
        }

        const isExpired = account.expiresIn < new Date();

        if (isExpired) {
            switch (account.provider) {
                case "google":
                    account.accessToken = await refreshGoogleToken(account.refreshToken, account.userId)
                    break;
                case "microsoft":
                    account.accessToken = await refreshMicrosoftToken(account.refreshToken, account.userId)
                    break;
            }
        }

        if (!account.accessToken) {
            return null;
        }

        return account.accessToken;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export async function getAppleCredentials(userId: string) {
    try {
        const account = await getAccount(userId, "apple");
        if(!account){
            return null;
        }

        if (!account.providerEmail || !account.credential) {
            return null;
        }

        return {
            username: account.providerEmail,
            credential: account.credential,
        };
    }
    catch (e){
        console.error(e);
        return null;
    }
}



