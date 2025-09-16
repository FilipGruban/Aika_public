import React from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Bell, BellDot} from "lucide-react";

function Notifications() {
    return (
        <Popover>
            <PopoverTrigger className={"cursor-pointer"}>
                <Bell className={"h-6 w-6 text-gray-800"}/>
            </PopoverTrigger>
            <PopoverContent>
                <h1>
                    Notifications to be implemented.
                </h1>
            </PopoverContent>
        </Popover>
    );
}

export default Notifications;