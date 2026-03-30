import NextAuth from "next-auth"
import config from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import {getUserById} from "@/lib/user";

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...config,
    callbacks:{
        ...config.callbacks,
        async jwt({token, user}){
            if(!token.sub) return token;

            if(user){
                token.role = user.role;
                token.premium = user.premium ? new Date(user.premium) : null;
                token.name = user.name;
                token.emailVerified = user.emailVerified ? new Date(user.emailVerified) : null;
                return token;
            }

            const dbUser = await getUserById(token.sub);
            if(!dbUser) return null;
            else {
                token.role = dbUser.role;
                token.premium = dbUser.premium ? new Date(dbUser.premium) : null;
                token.name = dbUser.name;
                token.emailVerified = dbUser.emailVerified ? new Date(dbUser.emailVerified) : null;
            }

            return token;
        },
    },
    secret: process.env.AUTH_SECRET
})