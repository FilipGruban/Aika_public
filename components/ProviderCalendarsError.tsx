import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import React from "react";

export default function CalendarError(){
    return(
        <Card className="border-dashed border-2 ">
            <CardHeader>
                <CardTitle className="text-lg">Something went wrong</CardTitle>
            </CardHeader>
        </Card>
    )
}