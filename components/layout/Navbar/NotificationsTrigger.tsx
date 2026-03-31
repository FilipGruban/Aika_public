import React from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Bell} from "lucide-react";
import NotificationsList from "@/components/layout/Navbar/NotificationsList";

function NotificationsTrigger() {
    return (
        <Popover>
            <PopoverTrigger className={"cursor-pointer hidden md:block"}>
                <Bell className={"h-6 w-6 text-gray-800"}/>
            </PopoverTrigger>
            <PopoverContent className={"min-w-lg"}>
                <NotificationsList/>
            </PopoverContent>
        </Popover>
    );
}

export default NotificationsTrigger;