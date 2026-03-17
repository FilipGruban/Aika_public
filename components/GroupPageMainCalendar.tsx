import React from 'react';

import {Provider} from "@prisma/client"
import Image from "next/image";
import {Badge} from "@/components/ui/badge";

const providerLogos = {
    apple: '/apple_logo.png',
    google: '/google_logo.png',
    microsoft: '/microsoft_logo.png',
};

interface Props {
    name: string;
    provider: Provider;
}

function GroupPageMainCalendar({name, provider}: Props) {
    return (
        <div
            className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all">
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-lg bg-background border shadow-sm flex items-center justify-center p-2">
                    <Image
                        src={providerLogos[provider]}
                        alt={`${provider} logo`}
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-sm sm:text-lg">{name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                        {provider} • Primary
                    </p>
                </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/ hidden sm:block">
                Main
            </Badge>
        </div>

    );
}

export default GroupPageMainCalendar;