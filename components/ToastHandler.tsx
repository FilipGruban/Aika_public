"use client";

import { useEffect } from "react";
import {toast} from "sonner";
import { usePathname, useSearchParams} from 'next/navigation'
import {useRef} from "react";
import {useRouter} from "next/navigation"

export default function ToastHandler(){
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