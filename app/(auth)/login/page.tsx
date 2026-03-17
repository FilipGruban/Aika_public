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
            <div className="w-full max-w-md p-6">
                <Card className="border-border shadow-2xl bg-card/90 backdrop-blur-xl rounded-2xl">
                    <CardHeader className="text-center space-y-2 pt-8 pb-6">
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            Welcome Back
                        </CardTitle>
                        <p className="text-muted-foreground">
                            Sign in to continue to Aika
                        </p>
                    </CardHeader>

                    <div className="px-8 pb-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
                                <FormInput
                                    type="text"
                                    name="email"
                                    control={form.control}
                                    label="Email"
                                    placeholder="you@example.com"
                                />
                                <FormInput
                                    type="password"
                                    name="password"
                                    control={form.control}
                                    label="Password"
                                    placeholder="••••••••"
                                />

                                <div className="flex items-center justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    disabled={form.formState.isSubmitting}
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                                >
                                    {form.formState.isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-center text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

export default Page;