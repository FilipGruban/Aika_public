import {Body, Button, Container, Head, Html, Preview, Tailwind, Text, pretty, render} from '@react-email/components';
import React from "react";

export default function ResetPasswordEmail({ verificationUrl }: { verificationUrl: string }) {
    return (
        <Html lang="en">
            <Head />
            <Tailwind>
                <Body className="m-0 p-0 w-full bg-[linear-gradient(135deg,#f8fafc_0%,#e6f4f1_100%)] font-sans">
                    <Preview>Password reset - Aika</Preview>

                    <table role="presentation" className="w-full h-full min-h-screen">
                        <tr>
                            <td align="center" valign="middle">

                                <Container className="w-[420px] max-w-[90%] bg-white rounded-2xl border border-gray-200 shadow-[0_25px_50px_rgba(0,0,0,0.08)] p-8">

                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <Text className="text-[20px] font-semibold text-slate-900 m-0">
                                            Password Reset
                                        </Text>
                                        <Text className="text-sm text-slate-500 mt-2">
                                            Reset your forgotten password
                                        </Text>
                                    </div>

                                    {/* Inner panel (adds depth 🔥) */}
                                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-5 mb-6">
                                        <Text className="text-sm text-slate-600 leading-relaxed m-0">
                                            We received a request to reset your password. Click the button below to choose a new one.
                                        </Text>

                                        <Text className="text-xs text-slate-400 mt-3">
                                            This link will expire in 1 hour.
                                        </Text>
                                    </div>

                                    {/* Button (smaller + cleaner) */}
                                    <div className="text-center mb-6">
                                        <Button
                                            href={verificationUrl}
                                            className="inline-block bg-teal-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium"
                                        >
                                            Reset Password
                                        </Button>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gray-200 my-6" />

                                    {/* Footer */}
                                    <Text className="text-xs text-slate-400 text-center leading-relaxed m-0">
                                        If you didn’t request this, you can safely ignore this email.
                                    </Text>

                                </Container>

                            </td>
                        </tr>
                    </table>
                </Body>
            </Tailwind>
        </Html>


    );
}

export async function renderResetPasswordEmail(verificationUrl : string) {
    const rawHtml = await render(<ResetPasswordEmail verificationUrl={verificationUrl}/>);
    return pretty(rawHtml);
}