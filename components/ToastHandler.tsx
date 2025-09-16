"use client";

import { useEffect } from "react";
import {toast} from "sonner";
import { usePathname } from 'next/navigation'
import {useRef} from "react";
import {useRouter} from "next/navigation"

export default function ToastHandler({connected, error,}: { connected?: string | string[]; error?: string | string[]; }){
    const pathname = usePathname()
    const hasShown = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (connected) {
            toast.success(connected);
            hasShown.current = true;
        }
        if (error) {
            toast.error(error);
            hasShown.current = true;
        }
        if (hasShown.current){
            router.replace(pathname);
        }
    }, [connected, error]);

    return null;
}