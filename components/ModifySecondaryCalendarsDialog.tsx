"use client"
import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Loader2, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAllProviderCalendars} from "@/hooks/calendars";
import { Provider} from "@prisma/client";
import {useForm} from "react-hook-form";
import {AddSecondaryCalendarsInput, addSecondaryCalendarsSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Checkbox} from "@/components/ui/checkbox";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import {CalendarDTO, ProviderCalendarResponse} from "@/types/calendar";
import {toast} from "sonner";
import {AxiosError} from "axios";
import axiosInstance from "@/lib/axios";
import {useRouter} from "next/navigation";

const providerLogos = {
    apple: '/apple_logo.png',
    google: '/google_logo.png',
    microsoft: '/microsoft_logo.png',
};

interface AddSecondaryCalendarDialogProps {
    groupId: string;
    existingCalendars: ProviderCalendarResponse[];
    availableProviders: Provider[];
}

function ModifySecondaryCalendarsDialog({groupId, existingCalendars, availableProviders} : AddSecondaryCalendarDialogProps) {

    const router = useRouter()
    const [isMutating, setIsMutating] = useState(false);
    const providerCalendars = useAllProviderCalendars(availableProviders, {owner: true, used: false});

    const form = useForm<AddSecondaryCalendarsInput>({
        resolver: zodResolver(addSecondaryCalendarsSchema),
        defaultValues:{
            calendars: existingCalendars
        }
    })

    const selectedCalendars = form.watch('calendars');

    const isCalendarSelected = (calendarId: string) => {
        return selectedCalendars.some(c => c.id === calendarId);
    };

    const handleToggleCalendar = (calendar: ProviderCalendarResponse, checked: boolean) => {
        const current = form.getValues('calendars');
        if (checked) {
            form.setValue('calendars', [
                ...current,
                { id: calendar.providerCalendarId, provider: calendar.provider }
            ]);
        } else {
            form.setValue('calendars',
                current.filter(c => c.id !== calendar.providerCalendarId)
            );
        }
    };

    const uniqueById = (calendars: ProviderCalendarResponse[]) =>
        Array.from(new Map(calendars.map(cal => [cal.providerCalendarId, cal])).values());

    const availableCalendars = uniqueById([
        ...Object.values(providerCalendars).flatMap(provider =>
            Array.isArray(provider.calendars) ? provider.calendars : []
        ),
        ...existingCalendars
    ])

    const handleSubmit = async (data: AddSecondaryCalendarsInput) => {
        try {
            const res = await axiosInstance.put(`/calendars/groups/${groupId}/calendars`, data);
            toast.success(res.data.message);

            setIsMutating(true)
            await Promise.all([
                providerCalendars.google.mutate?.(),
                providerCalendars.apple.mutate?.(),
                providerCalendars.microsoft.mutate?.()
            ]);
            setIsMutating(false);

            router.refresh();
        }
        catch (error) {
            console.error('[Modify Secondary] Error:', error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message || "Failed to modify secondary calendars");
            } else {
                toast.error("Something went wrong");
            }
        }
    }

    return (
            <Dialog>
                <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Calendar
                        </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader >
                        <DialogTitle>Manage Secondary Calendars</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Add or remove secondary calendars
                    </DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="calendars"
                                render={() => (
                                    <FormItem>
                                        {availableCalendars.length > 0 ? (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-3">
                                                {availableCalendars.map((calendar) => (
                                                    <FormField
                                                        key={calendar.providerCalendarId}
                                                        control={form.control}
                                                        name="calendars"
                                                        render={() => (
                                                            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                                                <Checkbox
                                                                    checked={isCalendarSelected(calendar.providerCalendarId)}
                                                                    onCheckedChange={(checked) =>
                                                                        handleToggleCalendar(calendar, checked as boolean)
                                                                    }
                                                                />
                                                                <div className="w-10 h-10 rounded-lg bg-background border shadow-sm items-center justify-center p-2 hidden sm:flex">
                                                                    <Image
                                                                        src={providerLogos[calendar.provider]}
                                                                        alt={`${calendar.provider} logo`}
                                                                        width={24}
                                                                        height={24}
                                                                        className="object-contain"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Label className="font-medium">
                                                                        {calendar.name}
                                                                    </Label>
                                                                    <p className="text-xs text-muted-foreground capitalize">
                                                                        {calendar.provider} • {calendar.accessRole}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                ))}
                                                {
                                                    Object.values(providerCalendars).some(provider => provider.isLoading)  &&
                                                    <div className="flex items-center justify-center py-2 text-muted-foreground text-xs">
                                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                        <span>Loading calendars...</span>
                                                    </div>
                                                }
                                                {
                                                    isMutating &&
                                                    <div className="flex items-center justify-center py-2 text-muted-foreground text-xs">
                                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                        <span>Revalidating calendars...</span>
                                                    </div>
                                                }
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
                                                No available calendars. All calendars are already in use.
                                            </div>
                                        )}

                                        {existingCalendars.length > 0 && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {existingCalendars.length} calendar{existingCalendars.length === 1 ? '' : 's'} selected
                                            </p>
                                        )}

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>

                </DialogContent>
            </Dialog>
    );
}

export default ModifySecondaryCalendarsDialog;