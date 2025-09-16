import { cookies } from "next/headers";
import crypto from "crypto";

export async function generateCsrfToken() {
    const token = crypto.randomBytes(32).toString("hex");

    (await cookies()).set("oauth_state", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
    });

    return token;
}

export async function verifyCsrfToken(state: string | null) {
    const stored = (await cookies()).get("oauth_state")?.value;
    return stored && state && stored === state;
}