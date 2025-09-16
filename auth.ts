import NextAuth from "next-auth"
import config from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...config,
    secret: process.env.AUTH_SECRET
})