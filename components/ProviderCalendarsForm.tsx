import React from 'react';
import {Form} from "@/components/ui/form";
import {Checkbox} from "@/components/ui/checkbox";
import {CardContent, CardFooter} from "@/components/ui/card";
import {Provider} from "@prisma/client"
import {Controller, useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import {toast} from "sonner";
import {CalendarItem} from "@/types/calendar";


interface Props {
    calendars: CalendarItem[];
    provider: Provider;
}


function ProviderCalendarsForm({calendars, provider} : Props) {
    const form = useForm<{calendars : CalendarItem[]}>({
        defaultValues: {calendars}
    });

    async function onSubmit({calendars}: { calendars: CalendarItem[] }) {
        try{
            const selected = calendars.filter(c => c.selected);
            await axiosInstance.post(`/calendars/${provider}/save`, {calendars: selected});
        }
        catch(e){
            console.error(e);
            toast.error(`Something went wrong saving ${provider} calendars`);
        }

    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="flex flex-col gap-4">
                    {
                        calendars.map((calendar, index) => (
                            <Controller
                                key={calendar.id}
                                name={`calendars.${index}.selected`}
                                control={form.control}
                                render={({field})=>(
                                <div className="p-3 border border-neutral-200 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-900">{calendar.name}</h3>
                                        <p className="text-xs text-muted-foreground">Access: {calendar.accessRole}</p>
                                    </div>
                                    <Checkbox className={"hover:cursor-pointer"} disabled={calendar.accessRole !== "owner"} checked={field.value} onCheckedChange={field.onChange} />
                                </div>
                            )}/>
                        ))
                    }
                </CardContent>
                <CardFooter>
                    <Button disabled={form.formState.isSubmitting} className={"ml-auto w-20"} type={"submit"}>Save</Button>
                </CardFooter>
            </form>
        </Form>
    );
}

export default ProviderCalendarsForm;