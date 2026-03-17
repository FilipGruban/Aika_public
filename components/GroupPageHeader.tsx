"use client"
import React, {useTransition} from 'react';
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ArrowLeft, MoreVertical, LucideCalendarSync} from "lucide-react";
import {toast} from "sonner";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {triggerSync} from "@/actions/synchronize";
import {useRouter} from "next/navigation";
import {mutate} from "swr";
interface Props {
    name: string;
    createdAt: Date;
    id: string;
}

function GroupPageHeader({name, createdAt, id}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    async function handleSync(){
        try {
            startTransition(async () => {
                const res = await triggerSync(id);
                if (!res.success){
                    toast.error(res.message)
                    return;
                }
                toast.success(res.message)
            });
        }
        catch (error){
            console.log(error)
            toast.error("Something went wrong");
        }
    }


    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/calendars/groups">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1 flex-1">
                    <h1 className="text-3xl font-bold">{name}</h1>
                    <p className="text-sm text-muted-foreground/80">
                        Created {createdAt.toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
                <Button disabled={isPending} variant="outline" size="sm" onClick={handleSync}>
                    <LucideCalendarSync className="w-4 h-4 mr-2" />
                    Synchronize
                </Button>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()} className={"sm:hidden flex"}>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSync}>
                        <LucideCalendarSync className="w-4 h-4 mr-2" />
                        Synchronize
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default GroupPageHeader;