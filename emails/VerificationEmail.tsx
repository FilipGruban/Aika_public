import {Body, Button, Container, Head, Html, Preview, Tailwind, Text, pretty, render} from '@react-email/components';
import React from "react";

export default function VerificationEmail({ verificationUrl }: { verificationUrl: string }) {
    return (
        <Html lang="en">
            <Head/>
            <Tailwind>
                <Body>
                    <Preview>Verify your email at Aika</Preview>
                    <Container className="w-full mx-auto text-center p-5 bg-background text-black">
                        <Text className="text-xl font-semibold mb-4">
                            Aika sign up email verification
                        </Text>
                        <Text className="text-base text-gray-600 mb-6">
                            Verify your email to log in.
                        </Text>
                        <Button
                            href={verificationUrl}
                            className="bg-black text-white  rounded-xl px-4 py-2"
                        >
                            Verify Email
                        </Button>
                        <Text className="text-xs text-gray-400 mt-6 ">
                            If you didn&rsquo;t make this request, you can safely ignore this email.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

export async function renderVerificationEmail(verificationUrl : string) {
    const rawHtml = await render(<VerificationEmail verificationUrl={verificationUrl}/>);
    return pretty(rawHtml);
}