'use client'
import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useProviderCalendars} from "@/hooks/calendars";
import {Provider} from "@prisma/client";
import {toast} from "sonner";
import {Separator} from "@/components/ui/separator";
import CalendarError from "@/components/ProviderCalendarsError";
import CalendarSkeleton from "@/components/ProviderCalendarsLoading";
import ProviderCalendarsForm from "@/components/ProviderCalendarsForm";
import Image from "next/image";

interface Props {
    provider : Provider;
}

function ProviderCalendars({provider} : Props) {
    const {isLoading, error, calendars} = useProviderCalendars(provider);


    if (isLoading) {
        return <CalendarSkeleton/>
    }

    if (error) {
        toast.error(`Failed to load calendars for ${provider}`);
        return <CalendarError/>
    }

    return (
        <>
            <Card className={"bg-white border-0"}>
                <CardHeader className="flex justify-between">
                    <CardTitle className={"text-xl flex items-center gap-4"}>
                        <Image src={`/${provider}_calendar.png`} alt={"provider logo"} width={35} height={35}/>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)} Calendars
                    </CardTitle>
                    <CardDescription >
                        {calendars.length}  calendars
                    </CardDescription>
                </CardHeader>
                <Separator className="bg-muted" />
                <ProviderCalendarsForm calendars={calendars} provider={provider} />
            </Card>
        </>

    );
}

export default ProviderCalendars;