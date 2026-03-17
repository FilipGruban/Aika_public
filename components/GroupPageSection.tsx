import React, {JSX} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {LucideProps} from "lucide-react";

import * as react from "react";

interface GroupPageSectionProps {
    title: string;
    subtitle?: string;
    Icon: react.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>
    children: JSX.Element;
    className?: string;
}

function GroupPageSection({title, subtitle, Icon, children, className}:GroupPageSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            {title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}

export default GroupPageSection;