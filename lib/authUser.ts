import {auth} from "@/auth";
import {userSchema} from "@/lib/zod";


export async function getCurrentUser() {
    const session = await auth();
    if (session?.user) {
        const user = userSchema.safeParse(session.user);
        if (!user.success || !user.data.emailVerified) {
            return null;
        }
        return user.data;
    }
    return null;
}