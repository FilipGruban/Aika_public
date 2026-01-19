import React from 'react';
import {FormField, FormMessage} from "@/components/ui/form";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {ProviderCalendarResponse} from "@/types/calendar";
import {UseFormReturn} from "react-hook-form";
import {cn} from "@/lib/utils";
import {Loader2} from "lucide-react";

interface MainCalendarRadioGroupProps {
    isLoading: boolean;
    error: string | null;
    calendars: ProviderCalendarResponse[];
    form: UseFormReturn<any>;
}

function MainCalendarRadioGroup({calendars, error, isLoading, form}: MainCalendarRadioGroupProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Loading calendars...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (calendars.length === 0) {
        return (
            <div className="rounded-lg border border-muted bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                No calendars found for this provider
            </div>
        );
    }

    const sortedCalendars = [...calendars].sort((a, b) => {
        if (a.used === b.used) return 0;
        return a.used ? 1 : -1;
    });

    return(
        <div className={"space-y-3"}>
            <div>
                <h4 className="text-sm font-medium mb-1">Select Primary Calendar</h4>
                <p className="text-xs text-muted-foreground">
                    Events from secondary calendars will be synced to this calendar
                </p>
            </div>

            <FormField
                name={"mainCalendarId"}
                control={form.control}
                render={({field})=>(
                    <>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                            {
                                sortedCalendars.map(calendar => (
                                    <div className="flex items-center gap-3" key={calendar.providerCalendarId}>
                                        <RadioGroupItem value={calendar.providerCalendarId} id={calendar.providerCalendarId} disabled={calendar.used} className={"border-primary"} />
                                        <Label className={cn(calendar.used && "text-muted-foreground cursor-not-allowed")} htmlFor={calendar.providerCalendarId}>{calendar.name}{calendar.used && " (Already in use)" }</Label>
                                    </div>
                                ))
                            }
                        </RadioGroup>
                        <p className={"text-muted-foreground text-xs"}>Calendar can be part of one group at time</p>
                        <FormMessage/>
                    </>
                )}
            />
        </div>
    )

}

export default MainCalendarRadioGroup;

