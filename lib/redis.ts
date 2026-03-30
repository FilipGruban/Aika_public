import Redis from "ioredis";

const redis = new Redis(process.env.DEV_REDIS_URI!);

export default redis;


export const connection = {
    url: process.env.DEV_REDIS_URI
};