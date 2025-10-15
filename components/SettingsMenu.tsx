"use client"
import React from 'react';
import Link from "next/link";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";

function SettingsMenu() {
    const pathname = usePathname();

    return (
        <aside className="sm:border-r sm:border-b-0 border-b sm:text-left text-center p-12">
            <h2 className={"font-semibold text-2xl mb-4"}>Settings</h2>
            <nav className="space-y-2 my-3 flex flex-col">
                <Link href="/dashboard/settings/account" className={cn("rounded-md px-3 py-2 text-base font-medium transition-colors", pathname === "/dashboard/settings/account" ? "bg-muted text-primary":"hover:bg-muted/40 text-muted-foreground")}>
                    Account
                </Link>
                <Link href="/dashboard/settings/providers" className={cn("rounded-md px-3 py-2 text-base font-medium transition-colors", pathname === "/dashboard/settings/providers" ? "bg-muted text-primary":"hover:bg-muted/40 text-muted-foreground")}>
                    Connections
                </Link>
            </nav>
        </aside>
    );
}

export default SettingsMenu;