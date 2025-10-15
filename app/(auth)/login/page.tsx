"use client"
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import FormInput from "@/components/FormInput";
import {useForm} from "react-hook-form";
import {signInSchema, SignInInput} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {login} from "@/actions/login";
import {toast} from "sonner";
import Link from "next/link";
import ToastHandler from "@/components/ToastHandler";

function Page() {

    const form = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    async function handleLogin(credentials: SignInInput) {
        try {
            const response = await login(credentials);
            if (!response) {
                toast.error("Something went wrong.")
                console.error("No response returned.")
                return;
            }
            if (!response.success) {
                toast.error(response.message)
            }
        } catch (error) {
            //prevent toast from displaying error on success (defaultni chovani redirectu hodi NEXT_REDIRECT error)
            if (error instanceof Error && error.message.includes("NEXT_REDIRECT")){
                return;
            }
            toast.error("Something went wrong.")
            console.error(error)
        }
    }

    return (
        <>
            <ToastHandler/>
            <div className="relative z-10 w-full max-w-md p-4">
                <Card
                    className="w-full space-y-2 p-8 rounded-2xl border border-border shadow-xl bg-card/90 backdrop-blur-md">
                    <CardHeader className="text-center space-y-1">
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            Welcome Back
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your Aika account
                        </p>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
                            <FormInput
                                type={"text"}
                                name="email"
                                control={form.control}
                                label="Email Address"
                                placeholder="you@example.com"
                                description="We'll use this to sign you in."
                            />
                            <FormInput
                                type="password"
                                name="password"
                                control={form.control}
                                label="Password"
                                placeholder="Enter your password"
                                description="Must be at least 8 characters."
                                className={"py-0"}
                            />
                            <Button
                                disabled={form.formState.isSubmitting}
                                type="submit"
                                variant="default"
                                className="w-full"
                            >
                                Log in
                            </Button>
                        </form>
                    </Form>
                    <div className={"flex items-center flex-col gap-2"}>
                        <div className="text-center text-sm text-muted-foreground">
                            Don’t have an account?{" "}
                            <Link href="/register" className="font-medium text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                        <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </Card>
            </div>
        </>
    );
}

export default Page;