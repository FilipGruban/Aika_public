import React, {Fragment} from 'react';
import {getCurrentUser} from "@/lib/authUser";
import { getProviders, getUsersCalendars} from "@/lib/user";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import Link from "next/link";
import {GroupCard} from "@/components/GroupCard";
import {Calendar} from "lucide-react";
import {Button} from "@/components/ui/button";

async function Page() {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    const [providers, userCalendarGroups] = await Promise.all([
        getProviders(user.id),
        getUsersCalendars(user.id)
    ])

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <div className="flex items-center sm:flex-row gap-4 flex-col justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-left text-center">Calendar Groups</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage automatic event synchronization across calendars
                    </p>
                </div>
                {providers.length > 0 && userCalendarGroups.length > 0 && (
                    <CreateGroupDialog providers={providers} />
                )}
            </div>

            {userCalendarGroups.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No calendar groups</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            {providers.length > 0
                                ? "Create a group to sync events between your calendars"
                                : "Connect calendar providers to get started"
                            }
                        </p>
                        {providers.length > 0 ? (
                            <CreateGroupDialog providers={providers} />
                        ) : (
                            <Link href="/dashboard/settings/providers">
                                <Button>Connect Providers</Button>
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="divide-y">
                        {userCalendarGroups.map((group) => (
                            <Fragment key={group.id}>
                                <GroupCard id={group.id} name={group.name} description={group.description} createdAt={group.createdAt} calendarCount={group.calendars.length} />
                            </Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;


