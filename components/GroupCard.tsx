"use client"
import {ArrowRight, Calendar} from "lucide-react";
import Link from "next/link";
import {formatDistanceToNow} from "date-fns";
import React from "react";

interface GroupCardProps {
    id: string;
    name: string;
    calendarCount?: number;
    createdAt: Date;
    description: string | null;
}

export function GroupCard({id, name, calendarCount = 0, createdAt, description}: GroupCardProps) {

    return (
        <Link
            href={`/dashboard/calendars/groups/${id}`}
            className="block hover:bg-muted/50 transition-colors"
        >
            <div className="p-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate mb-1">{name}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground truncate">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                        <div className="font-semibold text-lg">{calendarCount}</div>
                        <div className="text-muted-foreground text-xs">Calendars</div>
                    </div>
                    <div className="text-right min-w-[100px]">
                        <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(createdAt, { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
        </Link>
    );
}