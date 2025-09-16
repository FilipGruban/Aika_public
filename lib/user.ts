import {prisma} from "@/lib/prisma";
import {Provider} from "@prisma/client"

export const getUserById = async (id: string) => {
    try {
        return await prisma.user.findUnique({ where: { id: id }, omit:{password:true}});
    }
    catch {
        return null;
    }
}

export async function getAllAccounts(userId:string) {
    try {
        return await prisma.account.findMany({
            where: {
                userId,
            }
        })
    }
    catch(error){
        console.error("Could not get accounts", error);
        return null;
    }
}

export async function getAccount(userId:string, accountType:Provider) {
    try {
        return await prisma.account.findUnique({
            where: {
                UserWithProvider: {
                    userId,
                    provider: accountType,
                },
            },
        });
    }
    catch(error){
        console.error("Could not get user with linked account", error);
        return null;
    }
}