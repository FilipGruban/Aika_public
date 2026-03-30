"use client";

import { Suspense } from "react"
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation"

function ToastHandlerInner() {
    const params = useSearchParams();
    const success = params.get("success");
    const error = params.get("error");
    const info = params.get("info");

    const pathname = usePathname()
    const hasShown = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (success) {
            toast.success(success);
            hasShown.current = true;
        }
        if (error) {
            toast.error(error);
            hasShown.current = true;
        }
        if (info) {
            toast.info(info);
            hasShown.current = true;
        }
        if (hasShown.current){
            router.replace(pathname);
        }
    }, [success, error, info]);

    return null;
}

export default function ToastHandler() {
    return (
        <Suspense fallback={null}>
            <ToastHandlerInner />
        </Suspense>
    )
}