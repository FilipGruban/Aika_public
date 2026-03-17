"use client"
import React from 'react';
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {RequestResetPasswordInput, requestResetPasswordSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {requestPasswordReset} from "@/actions/reset-password";

function Page() {
    const form = useForm<RequestResetPasswordInput>({
        resolver: zodResolver(requestResetPasswordSchema),
        defaultValues:{
            email: ""
        }
    })


    async function handlePasswordReset({email}: RequestResetPasswordInput) {
        try {
            const response = await requestPasswordReset(email);

            if (!response.success) {
                toast.error(response.message)
                return;
            }
            toast.success(response.message);
            form.reset();

        } catch (error) {
            toast.error("Something went wrong.")
            console.error(error)
        }
    }


    return (
        <div className="relative z-10 w-full max-w-md p-4">
            <Card
                className="w-full p-8 rounded-2xl border border-border shadow-xl bg-card/90 backdrop-blur-md">
                <CardHeader className="text-center ">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Password Reset
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Reset your forgotten password
                    </p>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-3">
                        <FormInput
                            type={"text"}
                            name="email"
                            control={form.control}
                            label="Email Address"
                            placeholder="you@example.com"
                        />
                        <Button
                            disabled={form.formState.isSubmitting}
                            type="submit"
                            variant="default"
                            className="w-full"
                        >
                            Send
                        </Button>
                    </form>
                </Form>
                <div className={"flex items-center flex-col gap-2 border-t border-border pt-3"}>
                    <div className="text-center text-sm text-muted-foreground">
                        Don’t have an account?{" "}
                        <Link href="/register" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Page;
