import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {sendVerificationEmail} from "@/lib/email";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(new URL("/login?error=Invalid+verification+token", req.url));
    }

    try{
        const verificationToken =  await prisma.verificationToken.findUnique({
            where: {
                token
            },
            include:{
                user: true
            }});
        if(!verificationToken){
            return NextResponse.redirect(new URL("/login?error=Invalid+verification+token", req.url));
        }

        if (new Date(verificationToken.expires).getTime() <= Date.now()) {
            await sendVerificationEmail(verificationToken.user.id, verificationToken.user.email);
            return NextResponse.redirect(new URL("/login?info=Check+your+email+for+new+verification+token", req.url));
        }


        if(!verificationToken.user){
            return NextResponse.redirect(new URL("/login?error=Invalid+verification+token", req.url));
        }

        if(verificationToken.user.emailVerified){
            return NextResponse.redirect(new URL("/login?error=Email+already+verified", req.url));
        }

        await prisma.user.update({
            where: {
                id: verificationToken.user.id
            },
            data:{
                emailVerified: new Date()
            }}
        );

        await prisma.verificationToken.deleteMany({
            where: {
                userId: verificationToken.user.id
            }
        })

        return NextResponse.redirect(new URL("/login?success=Email+verified+successfully", req.url));
    }
    catch(err){
        console.error(err);
        return NextResponse.redirect(new URL("/login?error=Something+went+wrong", req.url));
    }

}