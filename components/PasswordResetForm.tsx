"use client"
import React from 'react';
import {useForm} from "react-hook-form";
import {ResetPasswordInput, resetPasswordSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {Button} from "@/components/ui/button";
import {resetPassword} from "@/actions/password";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

function PasswordResetForm({userId, token} : {userId: string, token: string}) {
    const router = useRouter()
    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues:{
            confirmPassword: "",
            password: ""
        }
    })

    async function handlePasswordReset({password} : {password: string}) {
        try {
            const res = await password(password, userId, token);

            if (!res.success){
                toast.error(res.message)
            }
            router.replace(`/login?success=${res.message}`);
        }
        catch (error) {
            console.log(error)
            toast.error("Something went wrong");
        }
    }

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
                    <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-5">
                        <FormInput
                            type={"password"}
                            name="password"
                            control={form.control}
                            label="New password"
                            placeholder={"Choose strong password"}
                        />
                        <FormInput
                            type={"password"}
                            name="confirmPassword"
                            control={form.control}
                            label="Confirm your new password"
                            placeholder={"Type matching password"}
                        />
                        <Button
                            disabled={form.formState.isSubmitting}
                            type="submit"
                            variant="default"
                            className="w-full"
                        >
                            Reset
                        </Button>
                    </form>
                </Form>
            </Card>
        </div>
    );
}

export default PasswordResetForm;