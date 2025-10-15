import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import {signInSchema} from "@/lib/zod";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {getUserById} from "@/lib/user";
import {sendVerificationEmail} from "@/lib/email";

export default {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const validatedCredentials = signInSchema.safeParse(credentials);

                if (!validatedCredentials.success) {
                    console.error("Validation failed:", validatedCredentials.error.format());
                    return null;
                }

                const {password, email} = validatedCredentials.data;
                try {
                    const user = await prisma.user.findUnique({where: {email: email}})

                    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        premium: user.premium,
                        role: user.role,
                        emailVerified: user.emailVerified,
                    };
                }catch (error) {
                    console.error("Error during authorization:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks:{
        async signIn({user}){
            if(!user || !user.id || !user.email){
                return "login?error=Invalid+user";
            }
            if(!user.emailVerified){
                return "/login?info=Verify+your+email+before+login";
            }
            return true;
        },
        async session({token, session}){
            if(token.sub && session.user){
                session.user.id = token.sub;
            }

            if(token.role && session.user){
                session.user.role = token.role;
            }

            if(token.emailVerified instanceof Date){
                session.user.emailVerified = token.emailVerified
            }

            return session;
        },
        async jwt({token}){
            if(!token.sub) return token;

            const user = await getUserById(token.sub);
            if(!user) return token;
            token.role = user.role;

            token.isPremium = user.premium;

            token.emailVerified = user.emailVerified ? new Date(user.emailVerified) : null;
            return token;
        },
    },
    pages: {
        signIn: "login",
    }
} satisfies NextAuthConfig