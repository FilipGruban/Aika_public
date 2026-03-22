'use client'
import React from 'react';
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {ChangePasswordInput, changePasswordSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {changePassword} from "@/actions/password";
import {toast} from "sonner";

export function AccountChangePassword() {

    const form = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues:{
            confirmPassword: '',
            password: '',
            currentPassword: ''
        }
    })

    const handlePasswordChange = async ({password, confirmPassword, currentPassword}: ChangePasswordInput) => {
        try {
            const res = await changePassword(currentPassword, password, confirmPassword, );

            if (!res.success){
                toast.error(res.message)
                return;
            }
            toast.success(res.message)
            form.reset()
        }
        catch (error) {
            console.log(error)
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="bg-white border rounded-xl p-6 my-4">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-4">
                    <FormInput
                        type="password"
                        name="currentPassword"
                        label="Current Password"
                        control={form.control}
                    />

                    <FormInput
                        type="password"
                        name="password"
                        label="New Password"
                        control={form.control}
                    />

                    <FormInput
                        type="password"
                        name="confirmPassword"
                        label="Confirm New Password"
                        control={form.control}
                    />

                    <div className="flex justify-end">
                        <Button
                            disabled={form.formState.isSubmitting}
                            type="submit"
                        >
                            {form.formState.isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AccountChangePassword;