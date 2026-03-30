import nodemailer from "nodemailer";
import crypto from "crypto";
import {addMinutes} from "date-fns";
import {prisma} from "@/lib/prisma";
import {renderVerificationEmail} from "@/emails/VerificationEmail";
import {renderResetPasswordEmail} from "@/emails/ResetPasswordEmail";

export const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST!,
    port: 587,
    auth: {
        user: process.env.NODEMAILER_USER!,
        pass: process.env.NODEMAILER_PASS!,
    },
});


export const mailOptions = {
    from: `Aika  <${process.env.NODEMAILER_USER}>`,
};


export async function sendVerificationEmail(id: string, email:string){
    const token = crypto.randomBytes(32).toString("hex");
    const expires = addMinutes(new Date(), 30);
    await prisma.verificationToken.create({
        data: {
            userId: id,
            token,
            expires,
        },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-email?token=${token}`;

    const html = await renderVerificationEmail(verificationUrl);

    const options = {
        ...mailOptions,
        to: email,
        subject: 'Verify Your Email Address',
        html: html,
    };

    await transporter.sendMail(options);

    return {
        success: true,
        message: "Verification email sent"
    };
}

export async function sendPasswordResetEmail(id: string, email:string){

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            userId: id,
            token,
            expires
        },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;


    const html = await renderResetPasswordEmail(resetUrl);

    const options = {
        ...mailOptions,
        to: email,
        subject: 'Password Reset',
        html: html,
    };
    await transporter.sendMail(options);

    return {
        success: true,
        message: "Password reset email sent"
    }

}