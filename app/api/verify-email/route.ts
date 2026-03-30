import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {emailQueue} from "@/lib/queues";
import {appUrl} from "@/lib/url";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(appUrl("/login?error=Invalid+verification+token"));
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
            return NextResponse.redirect(appUrl("/login?error=Invalid+verification+token"));
        }

        if (new Date(verificationToken.expires).getTime() <= Date.now()) {
            await emailQueue.add('verify-email', {userId: verificationToken.user.id, email: verificationToken.user.email})
            return NextResponse.redirect(appUrl("/login?info=Check+your+email+for+new+verification+token"));
        }


        if(!verificationToken.user){
            return NextResponse.redirect(appUrl("/login?error=Invalid+verification+token"));
        }

        if(verificationToken.user.emailVerified){
            return NextResponse.redirect(appUrl("/login?error=Email+already+verified"));
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

        return NextResponse.redirect(appUrl("/login?success=Email+verified+successfully"));

    }
    catch(err){
        console.error(err);
        return NextResponse.redirect(appUrl("/login?error=Something+went+wrong"));
    }

}