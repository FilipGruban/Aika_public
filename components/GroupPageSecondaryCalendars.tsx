import React from 'react';
import {Calendar} from "lucide-react";
import {ProviderCalendarResponse} from "@/types/calendar";
import ModifySecondaryCalendarsDialog from "@/components/ModifySecondaryCalendarsDialog";
import {Provider} from "@prisma/client";
import Image from "next/image";

interface Props {
    calendars: ProviderCalendarResponse[];
    providers: Provider[];
    groupId: string;
}
const providerLogos = {
    apple: '/apple_logo.png',
    google: '/google_logo.png',
    microsoft: '/microsoft_logo.png',
};

function GroupPageSecondaryCalendars({calendars, providers, groupId}: Props) {

    return (
        <>
            <ModifySecondaryCalendarsDialog availableProviders={providers} existingCalendars={calendars} groupId={groupId}/>
            {calendars.length > 0 ? (
                <div className="space-y-3 pt-3">
                    {calendars.map((calendar) => (
                        <div
                            key={calendar.providerCalendarId}
                            className="flex items-center justify-between p-4 px-6 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-medium">{calendar.name}</h3>
                                </div>
                            </div>
                            <Image
                                src={providerLogos[calendar.provider]}
                                alt={`${calendar.provider} logo`}
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                    <p>No secondary calendars added yet</p>
                    <p className="text-sm">Add calendars to start syncing events</p>
                </div>
            )}
        </>

    );
}

export default GroupPageSecondaryCalendars;