"use client"
import React from 'react';
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Edit, MoreVertical, Settings, Trash2} from "lucide-react";
import {deteleCalendarGroup} from "@/actions/group";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

interface Props {
    name: string;
    createdAt: Date;
    id: string;
}

function GroupPageHeader({name, createdAt, id}: Props) {
    const router  = useRouter()
    async function handleDelete(){
        try {
            const res = await deteleCalendarGroup(id)
            if (!res.success){
                toast.error(res.message)
                return;
            }
            toast.success(res.message)
            router.replace("/dashboard/calendars/groups");
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
                <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Group
                </Button>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()} className={"sm:hidden flex"}>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={()=>{}}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default GroupPageHeader;