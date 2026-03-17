import {RateLimiterRedis} from "rate-limiter-flexible";
import redis from "@/lib/redis";


export const rateLimiters = {
    emailVerification: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:email_verify',
        points: 3,
        duration: 900,
    }),

    passwordReset: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:password_reset',
        points: 3,
        duration: 3600,
    }),

    appleCalendar: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:calendar_apple',
        points: 10,
        duration: 60,
    }),

    googleCalendar: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:calendar_google',
        points: 15,
        duration: 60,
    }),

    microsoftCalendar: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:calendar_microsoft',
        points: 15,
        duration: 60,
    }),

    manualSync: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:manual_sync',
        points: 3,
        duration: 300,
    }),

    accountUpdate: new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'ratelimit:account_update',
        points: 1,
        duration: 300,
    })
};

export async function checkEmailVerificationLimit(email: string) {
    try {
        const result = await rateLimiters.emailVerification.consume(email.toLowerCase());
        return {
            success: true,
            remaining: result.remainingPoints,
        };
    } catch (rejRes: any) {
        return {
            success: false,
            retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
            message: `Too many verification emails sent. Try again in ${Math.ceil(rejRes.msBeforeNext / 1000 / 60)} minutes.`
        };
    }
}

export async function checkPasswordResetLimit(email: string) {
    try {
        const result = await rateLimiters.passwordReset.consume(email.toLowerCase());
        return {
            success: true,
            remaining: result.remainingPoints,
        };
    } catch (rejRes: any) {
        return {
            success: false,
            retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
            message: `Too many password reset emails sent. Try again in ${Math.ceil(rejRes.msBeforeNext / 1000 / 60)} minutes.`
        };
    }
}

export async function checkCalendarApiLimit(userId: string, provider: 'apple' | 'google' | 'microsoft') {
    const limiter = rateLimiters[`${provider}Calendar`];

    try {
        const result = await limiter.consume(userId);
        return {
            success: true,
            remaining: result.remainingPoints,
        };
    } catch (rejRes: any) {
        return {
            success: false,
            retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
            message: `Too many requests. Please try again in ${Math.ceil(rejRes.msBeforeNext / 1000)} seconds.`
        };
    }
}

export async function checkManualSyncLimit(userId:string){
    try {
        const result = await rateLimiters.manualSync.consume(userId);
        return {
            success: true,
            remaining: result.remainingPoints,
        }
    }
    catch (rejRes: any) {
        return {
            success: false,
            retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
            message: `Too many sync requests sent. Try again in ${Math.ceil(rejRes.msBeforeNext / 1000 / 60 )} minutes.`
        }
    }
}

export async function checkAccountUpdateLimit(userId:string){
    try {
        const result = await rateLimiters.accountUpdate.consume(userId);
        return {
            success: true,
            remaining: result.remainingPoints,
        }
    }
    catch (rejRes: any) {
        return {
            success: false,
            retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
            message: `Wait ${Math.ceil(rejRes.msBeforeNext / 1000 / 60 )} minutes before updating account.`
        }
    }
}