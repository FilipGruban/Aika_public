import {Body, Button, Container, Head, Html, Preview, Tailwind, Text, pretty, render} from '@react-email/components';
import React from "react";

export default function ResetPasswordEmail({ verificationUrl }: { verificationUrl: string }) {
    return (
        <Html lang="en">
            <Head/>
            <Tailwind>
                <Body>
                    <Preview>Password Reset</Preview>
                    <Container className="w-full mx-auto text-center p-5 bg-background text-black">
                        <Text className="text-xl font-semibold mb-4">
                            Aika reset password request
                        </Text>
                        <Text className="text-base text-gray-600 mb-6">
                            Click button bellow to reset your password
                        </Text>
                        <Button
                            href={verificationUrl}
                            className="bg-black text-white  rounded-xl px-4 py-2"
                        >
                            Reset Password
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

export async function renderResetPasswordEmail(verificationUrl : string) {
    const rawHtml = await render(<ResetPasswordEmail verificationUrl={verificationUrl}/>);
    return pretty(rawHtml);
}