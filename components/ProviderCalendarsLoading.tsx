import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import React from "react";

export default function CalendarSkeleton() {
    return(
        <Card className="border-dashed border-2 ">
            <CardHeader>
                <CardTitle className="text-lg">Loading calendars...</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="h-6 bg-muted rounded-md animate-pulse" />
                    <div className="h-6 bg-muted rounded-md animate-pulse" />
                    <div className="h-6 bg-muted rounded-md animate-pulse" />
                </div>
            </CardContent>
        </Card>
    )
}
