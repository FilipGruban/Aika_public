import redis from '@/lib/redis';
import {ProviderCalendarResponse} from "@/types/calendar";
import {Provider} from "@prisma/client";

const CACHE_TTL = 300;

export async function getCachedCalendars(
    userId: string,
    provider: Provider
): Promise<ProviderCalendarResponse[] | null> {
    const key = `calendars:${userId}:${provider}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
}

export async function setCachedCalendars(
    userId: string,
    provider: Provider,
    calendars: ProviderCalendarResponse[]
) {
    const key = `calendars:${userId}:${provider}`;
    await redis.set(key, JSON.stringify(calendars), 'EX', CACHE_TTL);
}

export async function invalidateCalendarCache(userId: string, provider?: Provider) {
    if (provider) {
        await redis.del(`calendars:${userId}:${provider}`);
    } else {
        const keys = await redis.keys(`calendars:${userId}:*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
}