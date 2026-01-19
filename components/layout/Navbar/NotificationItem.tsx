import {NotificationDTO} from "@/types/notification";
import {cn} from "@/lib/utils";
import React, {useState} from "react";
import {NotificationType} from '@prisma/client';
import {markNotificationRead} from "@/actions/notification";

function NotificationItem({notification} : {notification : NotificationDTO}) {
    const [read, setRead] = useState(notification.read);

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'sync':
                return '✅';
            case 'alert':
                return 'ℹ️'
            case 'error':
                return '❌';

        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const handleClick = async () => {
        if (read) return;

        setRead(true);

        const res = await markNotificationRead(notification.id)

    }

    return (
        <div
            className={cn(
                "px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer",
                !read && "bg-primary/5"
            )}
            onClick={handleClick}
        >
            <div className="flex items-start gap-2.5">
                <span className="text-lg mt-0.5">{getNotificationIcon(notification.type)}</span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <h4 className={cn(
                            "text-xs truncate",
                            !read ? "font-semibold" : "font-medium"
                        )}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTimeAgo(new Date(notification.createdAt))}
                        </span>
                    </div>

                    {notification.message && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {notification.message}
                        </p>
                    )}
                </div>

                {!read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
            </div>
        </div>
    );
}

export default NotificationItem;