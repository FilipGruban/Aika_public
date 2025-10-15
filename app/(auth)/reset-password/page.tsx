import React from 'react';
import PasswordResetForm from "@/components/PasswordResetForm";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";

async function Page({searchParams}: {searchParams: Promise<{ token: string }>}) {
    const {token} = await searchParams;

    if (!token) {
        redirect("/login?error=Invalid+reset+token");
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: {
            token
        }
    })

    if (!resetToken) {
        redirect("/login?error=Invalid+reset+token");
    }
    if(resetToken.expires.getTime() < Date.now()) {
        redirect("/login?error=Reset+token+is+expired");
    }


    return(
        <PasswordResetForm token={token} userId={resetToken.userId} />
    )
}

export default Page;