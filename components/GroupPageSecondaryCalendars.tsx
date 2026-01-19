import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Calendar, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ProviderCalendarResponse} from "@/types/calendar";
import ModifySecondaryCalendarsDialog from "@/components/ModifySecondaryCalendarsDialog";
import {Provider} from "@prisma/client";

interface Props {
    calendars: ProviderCalendarResponse[];
    providers: Provider[];
    groupId: string;
}

function GroupPageSecondaryCalendars({calendars, providers, groupId} : Props) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col items-center justify-between sm:flex-row gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Secondary Calendars
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Events from these calendars will be synced to your primary calendar
                        </p>
                    </div>
                    <ModifySecondaryCalendarsDialog availableProviders={providers} existingCalendars={calendars} groupId={groupId} />
                </div>
            </CardHeader>
            <CardContent>
                {calendars.length > 0 ? (
                    <div className="space-y-3">
                        {calendars.map((calendar) => (
                            <div
                                key={calendar.providerCalendarId}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-medium">{calendar.name}</h3>

                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No secondary calendars added yet</p>
                        <p className="text-sm">Add calendars to start syncing events</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default GroupPageSecondaryCalendars;