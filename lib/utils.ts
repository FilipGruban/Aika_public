import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
    const [first, last] = name.trim().split(" ");
    return (first[0] + last[0]).toUpperCase();
}