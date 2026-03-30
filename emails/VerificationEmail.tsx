import {Body, Button, Container, Head, Html, Preview, Tailwind, Text, pretty, render} from '@react-email/components';
import React from "react";

export default function VerificationEmail({ verificationUrl }: { verificationUrl: string }) {
    return (
        <Html lang="en">
            <Head />
            <Tailwind>
                <Body className="m-0 p-0 w-full bg-[linear-gradient(135deg,#f8fafc_0%,#e6f4f1_100%)] font-sans">
                    <Preview>Verify your email - Aika</Preview>

                    <table role="presentation" className="w-full h-full min-h-screen">
                        <tr>
                            <td align="center" valign="middle">

                                <Container className="w-[420px] max-w-[90%] bg-white rounded-2xl border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-10">

                                    {/* Top accent (🔥 rozdíl oproti resetu) */}
                                    <div className="w-12 h-1 bg-teal-600 rounded-full mx-auto mb-6" />

                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <Text className="text-[22px] font-semibold text-slate-900 m-0">
                                            Welcome to Aika
                                        </Text>

                                        <Text className="text-sm text-slate-500 mt-2 leading-relaxed">
                                            You're one step away from syncing your calendars
                                        </Text>
                                    </div>

                                    {/* Main message (bez panelu → víc airy) */}
                                    <div className="text-center mb-8">
                                        <Text className="text-sm text-slate-600 leading-relaxed m-0">
                                            Please confirm your email address to activate your account and start using Aika.
                                        </Text>
                                    </div>

                                    {/* CTA (víc prominent než u resetu) */}
                                    <div className="text-center mb-8">
                                        <Button
                                            href={verificationUrl}
                                            className="inline-block bg-teal-700 text-white rounded-xl px-6 py-3 text-sm font-medium shadow-sm"
                                        >
                                            Verify Email
                                        </Button>
                                    </div>

                                    {/* Subtle helper */}
                                    <Text className="text-xs text-slate-400 text-center leading-relaxed m-0">
                                        This step helps us keep your account secure.
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

export async function renderVerificationEmail(verificationUrl : string) {
    const rawHtml = await render(<VerificationEmail verificationUrl={verificationUrl}/>);
    return pretty(rawHtml);
}