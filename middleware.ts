import authConfig from "./auth.config"
import NextAuth from "next-auth"
import {NextResponse} from "next/server";


const { auth } = NextAuth(authConfig)

const authPrefix = '/api/auth';
const publicPaths = ["/",];
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
//const adminPaths = ["/admin"];


export default auth((req)=> {

    const nextUrl  = req.nextUrl;
    const isLoggedIn = !!req.auth;

    if(nextUrl.pathname.startsWith(authPrefix)){
        return NextResponse.next();
    }

    if (isInPathList(nextUrl.pathname, publicPaths)) {
        return NextResponse.next();
    }

    if(isInPathList(nextUrl.pathname, authPaths)){
        if(isLoggedIn){
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return NextResponse.next();
    }

    if(!isInPathList(nextUrl.pathname, publicPaths) && !isLoggedIn){
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // ADMIN-ONLY ROUTES TO BE IMPLEMENTED

    return NextResponse.next();
})

function isInPathList(path: string, list: string[]) {
    return list.includes(path)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|icon.svg).*)'],
}