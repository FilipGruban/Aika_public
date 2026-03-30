import {prisma} from "@/lib/prisma";
import {Provider} from "@prisma/client"

export const getUserById = async (id: string) => {
    try {
        return await prisma.user.findUnique({ where: { id: id }, omit:{password:true}});
    }
    catch (e){
        console.error("getUserById error:", e); // ← přidej toto
        return null;
    }
}

export const getUserByEmail = async (email: string) => {
    try {
        return await prisma.user.findUnique({ where: { email: email }, omit:{password:true}});
    }
    catch {
        return null;
    }
}

export async function getAllAccounts(userId:string) {
    try {
        const accounts = await prisma.account.findMany({
            where: {
                userId,
            }
        })
        if (accounts.length === 0) {
            return null;
        }
        return accounts;
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

export async function getUsersCalendars(userId:string) {
    try {
        return await prisma.calendarGroup.findMany({
            where: {
                userId,
            },
            include: {
                calendars:true
            }
        })
    }
    catch(error){
        console.error("Could not get users calendars", error);
        return [];
    }
}

export async function getProviders(userId:string) {
    const accounts = await getAllAccounts(userId);
    const hasAccounts = accounts && accounts.length > 0;
    return hasAccounts ? accounts.map(acc => acc.provider) : [];
}