import React from 'react';
import {getCurrentUser} from "@/lib/authUser";
import ConnectionCard from "@/components/ConnectionCard";
import {getAllAccounts} from "@/lib/user";
import ToastHandler from "@/components/ToastHandler"

async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }
    const userAccounts = await getAllAccounts(user.id)

    const params = await searchParams;
    const connected = params.connected;
    const error = params.error;


    return (
        <>
            <div className="flex flex-col gap-4">
                <ToastHandler connected={connected} error={error} />
                <ConnectionCard name={"Google"} image={"/google_calendar.png"} description={"Connect your Google account to synchronize google calendar."} isConnected={userAccounts ? userAccounts.some(e => e.provider === "google") : false} url={"/oauth/google/url"}/>
                <ConnectionCard name={"Microsoft"} image={"/outlook_calendar.png"} description={"Connect your Microsoft account to synchronize outlook calendar."} isConnected={userAccounts ? userAccounts.some(e => e.provider === "microsoft") : false} url={"/oauth/microsoft/url"}/>
                <ConnectionCard name={"Apple"} image={"/apple_calendar.png"} description={"Connect your Apple account to synchronize icloud calendar."} isConnected={userAccounts ? userAccounts.some(e => e.provider === "apple") : false} url={"/dashboard/settings/providers/connect/apple"}/>
            </div>
        </>

    );
}

export default Page;