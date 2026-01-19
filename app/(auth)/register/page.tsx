'use client'
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {useForm} from "react-hook-form";
import {SignUpInput, signUpSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {signUp} from "@/actions/signup";
import {toast} from 'sonner';
import Link from "next/link";

function Page() {
    const form = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    async function handleSignUp(credentials: SignUpInput) {
        try {
            const response = await signUp(credentials);
            if (!response) {
                toast.error("Something went wrong.")
                return;
            }
            if (!response.success) {
                toast.error(response.message);
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
        <div className="w-full max-w-md p-6">
            <Card className="border-border shadow-2xl bg-card/90 backdrop-blur-xl rounded-2xl">

                <CardHeader className="text-center space-y-2 pt-8 pb-6">
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Create Account
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Join Aika and start organizing
                    </p>
                </CardHeader>

                <div className="px-8 pb-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                            <FormInput
                                type="text"
                                name="name"
                                control={form.control}
                                label="Full Name"
                                placeholder="John Doe"
                                description={"Enter your full name"}
                            />
                            <FormInput
                                type="text"
                                name="email"
                                control={form.control}
                                label="Email"
                                placeholder="you@example.com"
                                description={"We will send you verification email"}
                            />
                            <FormInput
                                type="password"
                                name="password"
                                control={form.control}
                                label="Password"
                                placeholder="••••••••"
                                description={"Enter your password"}
                            />
                            <FormInput
                                type="password"
                                name="confirmPassword"
                                control={form.control}
                                label="Confirm Password"
                                placeholder="••••••••"
                                description={"Make sure passwords match"}
                            />

                            <div className="pt-2">
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
                                            Creating account...
                                        </span>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>


                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Page;