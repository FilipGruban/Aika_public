'use client'
import React from 'react';
import {useNotifications} from "@/hooks/notifications";
import {Bell, Loader2} from "lucide-react";
import NotificationItem from "@/components/layout/Navbar/NotificationItem";

function NotificationsList() {
    const {notifications, error, isLoading} = useNotifications();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive text-center">
                Something went wrong while fetching notifications.
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">No notifications</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
    );



}

export default NotificationsList;



