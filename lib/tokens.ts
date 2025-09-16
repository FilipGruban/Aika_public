import {Provider} from "@prisma/client";
import {prisma} from "@/lib/prisma";

interface TokenType{
    refreshToken?: string;
    accessToken?: string;
    expiresIn?: number;
    userId: string;
    providerUserId: string;
    provider: Provider;
    username: string;
    credential?: string;

}

export async function saveToken({refreshToken, accessToken, expiresIn, userId, providerUserId, provider, username, credential}: TokenType) {
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    await prisma.account.create({
        data:{
            userId,
            providerUserId,
            provider,
            username,
            credential,
            accessToken,
            refreshToken,
            expiresIn: expiresAt,
        }
    })
}