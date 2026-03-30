export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export function appUrl(path: string) {
    return new URL(path, BASE_URL)
}