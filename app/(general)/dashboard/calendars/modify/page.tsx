import React, {Fragment} from 'react';
import ProviderCalendars from "@/components/ProviderCalendars";
import {getCurrentUser} from "@/lib/authUser";
import {getAllAccounts} from "@/lib/user";
import {Separator} from "@/components/ui/separator";

async function Page() {
    const user = await getCurrentUser();
    if (!user) {
        return;
    }

    const connectedProviders = await getAllAccounts(user.id)

    if(!connectedProviders){
        return(
            <>
                connect some providers first
            </>
        )
    }

    return (

        <div className="flex justify-center items-center min-h-svh">
            <div className="w-2xl mx-auto p-6 space-y-6 pt-20">
                <h1 className="text-2xl font-bold text-center">Modify Calendars</h1>
                <p className="text-sm font-bold text-center text-muted-foreground">Select calendars you want to synchronize</p>
                {connectedProviders.map(({provider}, index) => (
                    <Fragment key={provider}>
                        <ProviderCalendars provider={provider} />
                        {
                            connectedProviders.length !== index + 1 && <Separator/>
                        }
                    </Fragment>

                ))}
            </div>
        </div>
);
}

export default Page;