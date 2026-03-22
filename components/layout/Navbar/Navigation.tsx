import React from 'react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import Link from "next/link";

function Navigation() {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger  className={"bg-transparent hover:bg-transparent data-[state=open]:hover:bg-transparent focus:bg-transparent"} >Calendars</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className={"flex flex-col w-[250px] gap-4"}>
                            <ListItem
                                href={"/dashboard/calendars/groups"}
                                title={"My Calendars"}
                            >Display your calendars</ListItem>
                            <ListItem
                                href={"/dashboard/calendars/about"}
                                title={"Help"}
                            >Learn about calendars</ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className={"bg-transparent hover:bg-transparent data-[state=open]:hover:bg-transparent focus:bg-transparent"}>Premium</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className={"flex flex-col w-[250px] gap-4"}>
                            <ListItem
                                href={"/dashboard/premium/about"}
                                title={"About Premium"}
                            >Learn more about premium features</ListItem>
                            <ListItem
                                href={"/dashboard/premium/buy-premium"}
                                title={"Buy Premium"}
                            >Gain access to premium features</ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className={"bg-transparent hover:bg-transparent data-[state=open]:hover:bg-transparent focus:bg-transparent"}>Settings</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className={"flex flex-col w-[250px] gap-4"}>
                            <ListItem
                                href={"/dashboard/settings/account"}
                                title={"My Account"}
                            >Modify personal information</ListItem>
                            <ListItem
                                href={"/dashboard/settings/providers"}
                                title={"Connections"}
                            >Link provider accounts to sync calendars</ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

function ListItem({
    title,
    children,
    href,
    }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
    )
}

export default Navigation;



