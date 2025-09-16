"use client"
import React from 'react';
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {ResetPasswordInput, resetPasswordSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";

function Page() {
    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues:{
            email: ""
        }
    })

    return (
        <div className="relative z-10 w-full max-w-md p-4">
            <Card
                className="w-full space-y-2 p-8 rounded-2xl border border-border shadow-xl bg-card/90 backdrop-blur-md">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Password Reset
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Reset your forgotten password
                    </p>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(()=>{})} className="space-y-5">
                        <FormInput
                            type={"text"}
                            name="email"
                            control={form.control}
                            label="Email Address"
                            placeholder="you@example.com"
                            description="We'll send you recovery email."
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
                <div className={"flex items-center flex-col gap-4"}>
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