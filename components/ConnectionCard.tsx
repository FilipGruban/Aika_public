"use client"
import React from 'react';
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {useRouter} from "next/navigation";
import axiosInstance from "@/lib/axios";
import {toast} from "sonner";

interface ConnectionCardProps {
    image: string;
    name: string;
    description: string;
    isConnected: boolean;
    url: string;
}

function ConnectionCard({image, isConnected, name, description, url}: ConnectionCardProps) {
    const router = useRouter();

    async function handleConnect() {
        try {
            if(name == "Apple"){
                router.push(url);
            }
            else{
                const res = await axiosInstance.get(url);
                router.push(res.data.url);
            }
        }
        catch (error) {
            toast.error("Something went wrong");
            console.log(error);
        }
    }

    return (
        <div className="flex gap-8 items-center justify-between p-4 border rounded-2xl shadow-sm bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-4">
                <Image src={image} alt={name} width={40} height={40} className="rounded" />
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <Button onClick={handleConnect} variant={isConnected ? "secondary" : "default"} disabled={isConnected}>
                {isConnected ? "Connected" : "Connect"}
            </Button>
        </div>
    );
}

export default ConnectionCard;