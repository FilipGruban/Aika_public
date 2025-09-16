"use client"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getInitials} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Separator} from "@/components/ui/separator";
import Link from "next/link";
import {CalendarCog, LucideProps, Settings, Crown} from "lucide-react";
import React, {ForwardRefExoticComponent, RefAttributes, useState} from "react";
import {UserType} from "@/lib/zod";
import {signOutAction} from "@/actions/signout";

function UserMobile({user}: {user: UserType}) {
    const [open, setOpen] = useState(false)
    return (
        <div className="md:hidden flex items-center space-x-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger>
                    <Avatar className={"h-10 w-10 cursor-pointer"}>
                        <AvatarImage src="/user.svg" alt="user avatar" />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent className={"w-80"}>
                    <div className="grid gap-4">
                        <div className="mb-4 space-y-1 text-center">
                            <p>Logged in as:</p>
                            <h4 className="leading-none font-bold">{user.name}</h4>
                        </div>
                        <div className="grid gap-10 text-center">
                            <LinkGroup title={"Calendars"} icon={CalendarCog}>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/calendar-groups"}>My Groups</Link>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/calendar-groups/new"}>Create Group</Link>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/calendar-groups/about"}>About Groups</Link>
                            </LinkGroup>
                            <LinkGroup title={"Premium"} icon={Crown}>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/premium"}>Buy Premium</Link>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/premium/about"}>About Premium</Link>
                            </LinkGroup>
                            <LinkGroup title={"Settings"} icon={Settings}>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/settings/account"}>My Account</Link>
                                <Link className={"text-md leading-none"} onClick={() =>setOpen(false)} href={"/dashboard/settings/providers"}>Link Provider</Link>
                                <form
                                    action={signOutAction}
                                >
                                    <button className={"text-destructive cursor-pointer w-full"} type="submit">
                                        Log Out
                                    </button>
                                </form>
                            </LinkGroup>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}


function LinkGroup({title, children, icon: Icon}: {title: string, children: React.ReactNode, icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>}) {
    return (
        <div className="grid gap-2 text-center">
            <div className="flex flex-col gap-2">
                <h2 className={"leading-none font-medium flex justify-center items-center gap-2"}>{title}<Icon/></h2>
                <Separator className={"text-muted"}/>
                <span className={"flex flex-col gap-5 mt-3"}>
                   {children}
                </span>
            </div>
        </div>
    );
}

export default UserMobile;