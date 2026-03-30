"use client"
import React from 'react';
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {appleIdInput, appleIdSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import {toast} from "sonner";
import { useRouter } from "next/navigation";
import {AxiosError} from "axios";

function AppleForm() {
    const router = useRouter();
    const form = useForm<appleIdInput>({
        resolver: zodResolver(appleIdSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })
    async function handleSave(credentials: appleIdInput) {
        try {
            const response = await axiosInstance.post("/oauth/apple/connect", {credentials: credentials});

            router.replace("/dashboard/settings/providers?success=Apple+successfully+connected");
        } catch (error) {
            if (error instanceof AxiosError && error.status === 401) {
                toast.error("Invalid credentials")
                return;
            }
            toast.error("Something went wrong");
            console.log(error);
        }
    }

    return (
         <div className={"flex justify-center w-full"}>
             <Card
                 className="min-w-1/2 space-y-2 p-8 rounded-2xl border border-border shadow-xl bg-card/90 backdrop-blur-md">
                 <CardHeader className="text-center space-y-1">
                     <CardTitle className="text-2xl font-semibold tracking-tight">
                         Connect Apple Calendar
                     </CardTitle>
                     <p className="text-sm text-muted-foreground">
                         Enter you apple credentials
                     </p>
                 </CardHeader>
                 <Form {...form}>
                     <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
                         <FormInput
                             type={"text"}
                             name="email"
                             control={form.control}
                             label="Email Address"
                             placeholder="you@example.com"
                             description="Your apple account email"
                         />
                         <FormInput
                             type="password"
                             name="password"
                             control={form.control}
                             label="App-specific password"
                             placeholder="XXXX-XXXX-XXXX-XXXX"
                             description="Generate app specific password at account.apple.com"
                             className={"py-0"}
                         />
                         <Button
                             disabled={form.formState.isSubmitting}
                             type="submit"
                             variant="default"
                             className="w-full"
                         >
                             Save
                         </Button>
                     </form>
                 </Form>
                 <Tooltip delayDuration={300} >
                     <TooltipTrigger  className={"text-muted-foreground text-xs self-center hidden sm:flex"}>
                         Need help?
                     </TooltipTrigger>
                     <TooltipContent className="text-xs text-muted-foreground bg-white  border-1 border-gray-200">
                         <div className="space-y-1">
                             <p>
                                 Apple does not support OAuth for iCloud Calendar.<br/> Instead, you need to use an
                                 <strong> app-specific password</strong>.
                             </p>
                             <ol className="list-decimal list-inside space-y-1">
                                 <li>
                                     Go to &nbsp;
                                     <Link href="https://appleid.apple.com/account/manage"
                                        rel="noopener noreferrer" className=" text-blue-600">
                                          appleid.apple.com
                                     </Link> and sign in with your Apple ID.
                                 </li>
                                 <li>Under <strong>Sign-In and Security</strong>, find <strong>App-Specific Passwords</strong>.</li>
                                 <li>Click <strong>Generate</strong> and paste it here along with your Apple ID email.</li>
                             </ol>
                         </div>
                     </TooltipContent>
                 </Tooltip>
                 <div className="flex flex-col sm:hidden text-xs text-muted-foreground">
                     <h3 className={"font-semibold text-sm"}>What is app-specific password?</h3>
                     <div className="space-y-1">
                         <p>
                             Apple does not support OAuth for iCloud Calendar.<br/> Instead, you need to use an
                             <strong> app-specific password</strong>.
                         </p>
                         <ol className="list-decimal list-inside space-y-1">
                             <li>
                                 Go to &nbsp;
                                 <Link href="https://appleid.apple.com/account/manage"
                                       rel="noopener noreferrer" className=" text-blue-600">
                                     appleid.apple.com
                                 </Link> and sign in with your Apple ID.
                             </li>
                             <li>Under <strong>Sign-In and Security</strong>, find <strong>App-Specific Passwords</strong>.</li>
                             <li>Click <strong>Generate</strong> and paste it here along with your Apple ID email.</li>
                         </ol>
                     </div>
                 </div>
             </Card>
         </div>
    );
}

export default AppleForm;