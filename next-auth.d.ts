import {type DefaultSession} from 'next-auth';
import {UserRole} from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] & {
    role : UserRole,
    emailVerified: Date | null,
    premium: Boolean
};


declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}