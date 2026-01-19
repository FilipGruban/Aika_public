import React, {Fragment} from 'react';
import {getCurrentUser} from "@/lib/authUser";
import { getProviders, getUsersCalendars} from "@/lib/user";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import Link from "next/link";
import {GroupCard} from "@/components/GroupCard";

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
        <div className="flex justify-center">
            <div className="w-2xl mx-auto p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Your Calendar Groups</h1>
                    <p className="text-muted-foreground">
                        Create and manage your calendar groups
                    </p>
                </div>
                <section className="flex flex-col gap-4">
                    {userCalendarGroups.map((group) => (
                        <Fragment key={group.id}>
                            <GroupCard
                                id={group.id}
                                name={group.name}
                                calendarCount={group.calendars.length}
                                createdAt={group.createdAt}
                                description={group.description}
                            />
                        </Fragment>
                    ))}
                    {
                        providers.length > 0 ?
                            <CreateGroupDialog providers={providers}/>
                                :
                            <Link href="/dashboard/settings/providers" className="block text-center px-6 py-4 bg-muted/50 border-2 border-dashed border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground">
                                You'll need to connect some providers before creating a calendar group
                            </Link>
                    }
                </section>
            </div>
        </div>
);
}

export default Page;


