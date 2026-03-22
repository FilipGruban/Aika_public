"use client"
import React, {FormEvent} from 'react';
import {useForm} from "react-hook-form";
import {CalendarGroupSettingsInput, calendarGroupSettingsSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {saveSettings} from "@/actions/settings";
import {toast} from "sonner";


const SYNC_FREQUENCY_OPTIONS = [
    {label: "Every 15 minutes", value: "15"},
    {label: "Every hour", value: "60"},
    {label: "Every 2 hours", value: "120"},
] as const;

interface GroupPageSettingsProps {
    groupId: string;
    syncEnabled?: boolean;
    nameDuplicationEnabled?: boolean;
    syncFrequencyMinutes?: string;
    isPremium: Date | null;
}

function GroupPageSettings({nameDuplicationEnabled, syncEnabled, syncFrequencyMinutes, groupId, isPremium}: GroupPageSettingsProps) {


    const form = useForm<CalendarGroupSettingsInput>({
        resolver: zodResolver(calendarGroupSettingsSchema),
        defaultValues: {
            syncEnabled: syncEnabled,
            nameDuplicationEnabled: nameDuplicationEnabled,
            syncFrequencyMinutes: syncFrequencyMinutes?.toString() as "15" | "60" | "120"
        },
    });

    const handleSubmit = async(settings: CalendarGroupSettingsInput) => {
        try {
            const res = await saveSettings(settings, groupId)

            if(!res.success) {
                toast.error(res.message)
                return;
            }
            toast.success(res.message);
        }
        catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="syncEnabled"
                        render={({field}) => (
                            <FormItem className="flex flex-row items-center justify-between p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium">Enable Sync</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                        Enable sync events from primary to secondary calendars
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nameDuplicationEnabled"
                        render={({field}) => (
                            <FormItem className="flex flex-row items-center justify-between p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium">
                                        Enable Duplicate Names
                                    </FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                        When an event with the same name exists but different time,
                                        create new event instead of updating existing one
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="syncFrequencyMinutes"
                        render={({field}) => (
                            <FormItem className="p-4 flex justify-between">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium">Sync Frequency</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground mt-2">
                                        How often to check for calendar updates
                                    </FormDescription>
                                </div>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select sync frequency"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SYNC_FREQUENCY_OPTIONS.map((option) => {
                                            const isDisabled = option.value === "15" && !isPremium;
                                            return (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                    disabled={isDisabled}
                                                >
                                                    {option.label}
                                                    {isDisabled && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            (Premium)
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default GroupPageSettings;