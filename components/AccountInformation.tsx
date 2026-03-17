"use client"
import React from 'react';
import {Input} from "@/components/ui/input";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {updateProfileSchema, UpdateProfileType} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {updateAccount} from "@/actions/account";
import {Label} from "@/components/ui/label";
import {useRouter} from "next/navigation";

interface AccountInformationProps {
    username: string;
    email: string;
}

function AccountInformation({username, email}: AccountInformationProps) {

    const router = useRouter();
    const form = useForm<UpdateProfileType>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues:{
            name: username
        }
    });

    const handleUpdateAccount = async (updatedUser:UpdateProfileType) => {
        try {
            const res = await updateAccount(updatedUser);
            if (!res.success){
                toast.error(res.message)
                return;
            }

            toast.success(res.message);
            router.refresh()
        }
        catch (error) {
            console.log(error)
            toast.error("Something went wrong");
        }
    }


    return (
        <div className="flex-1 w-full">
            <div className="bg-white border rounded-xl p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">Profile Information</h2>
                    <p className="text-sm text-muted-foreground">Your basic account details</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdateAccount)} className="space-y-4">
                        <FormInput
                            type="text"
                            name="name"
                            label="Username"
                            control={form.control}
                        />

                        <div>
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="mt-1.5 bg-muted"
                            />
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Email cannot be changed
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                disabled={form.formState.isSubmitting}
                                type="submit"
                            >
                                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default AccountInformation;