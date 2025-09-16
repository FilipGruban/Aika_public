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
            toast.success("Signed up successfully");
            form.reset();
        } catch (error) {
            toast.error("Something went wrong.")
            console.error(error)
        }
    }


    return (
        <div className="relative z-10 w-full max-w-md p-4">
            <Card
                className="space-y-2 p-8 rounded-2xl border border-border shadow-2xl bg-card/90 backdrop-blur-md">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Create an Account
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Join Aika and get started
                    </p>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-5">
                        <FormInput
                            type="text"
                            name="name"
                            control={form.control}
                            label="Full Name"
                            placeholder="John Doe"
                            description="Enter your full name."
                        />
                        <FormInput
                            type={"text"}
                            name="email"
                            control={form.control}
                            label="Email Address"
                            placeholder="you@example.com"
                            description="We'll send you a confirmation email."
                        />
                        <FormInput
                            type="password"
                            name="password"
                            control={form.control}
                            label="Password"
                            placeholder="Choose a strong password"
                            description="Must be at least 8 characters."
                        />
                        <FormInput
                            type="password"
                            name="confirmPassword"
                            control={form.control}
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            description="Make sure both passwords match."
                        />
                        <Button
                            disabled={form.formState.isSubmitting}
                            type="submit"
                            variant="default"
                            className="w-full"
                        >
                            Sign up
                        </Button>
                    </form>
                </Form>
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Log in
                    </Link>
                </div>
            </Card>
        </div>
    );
}

export default Page;