import {getCurrentUser} from "@/lib/authUser";
import {prisma} from "@/lib/prisma";
import GroupPageHeader from "@/components/GroupPageHeader";
import GroupPageMainCalendar from "@/components/GroupPageMainCalendar";
import GroupPageSecondaryCalendars from "@/components/GroupPageSecondaryCalendars";
import { toProviderCalendarResponse} from "@/lib/utils";
import {getProviders} from "@/lib/user";
import GroupPageSection from "@/components/GroupPageSection";
import {Settings, Calendar, TriangleAlert, ClipboardList} from "lucide-react";
import GroupPageSettings from "@/components/GroupPageSettings";
import GroupPageDangerZone from "@/components/GroupPageDangerZone";
import GroupPageLogs from "@/components/GroupPageLogs";
import {getCalendarGroup} from "@/lib/calendar";
import { Metadata } from "next";



export async function generateMetadata({ params } : {params : Promise<{id: string}>}): Promise<Metadata> {
    const {id} = await params;
    const user = await getCurrentUser();
    if (!user) return{title: "Unknown group", description: "Manage sync settings for Unknown group"}


    const group = await getCalendarGroup(id, user.id)
    if(!group) return{title: "Unknown group", description: "Manage sync settings for Unknown group"}

    return {
        title: group.name,
        description: `Manage sync settings for ${group.name}`,
    };
}

async function Page({ params }: { params: Promise<{ id: string }>}) {
    const {id} = await params;

    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    const calendarGroup = await prisma.calendarGroup.findUnique({
        where: {
            id: id,
            userId: user.id,
        },
        include:{
            primaryCalendar: true,
            calendars: true,
            settings: true
        }
    })

    if (!calendarGroup) {
        return (
            <div className={"text-center"}>
                Group not found
            </div>
        )
    }

    const calendarClient = calendarGroup.calendars.map((calendar) => toProviderCalendarResponse(calendar) );
    const providers = await getProviders(user.id);
    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <GroupPageHeader createdAt={calendarGroup.createdAt} name={calendarGroup.name} id={calendarGroup.id} />
                <GroupPageSection title={calendarGroup.name} subtitle={"This is you source calenadar"} Icon={Calendar}>
                    <GroupPageMainCalendar name={calendarGroup.primaryCalendar.name} provider={calendarGroup.primaryCalendar.provider}/>
                </GroupPageSection>
                <GroupPageSection title={"Secondary calendars"} subtitle={"Events from these calendars will be synced to your primary calendar"} Icon={Calendar}>
                    <GroupPageSecondaryCalendars calendars={calendarClient} providers={providers} groupId={calendarGroup.id} />
                </GroupPageSection>
                <GroupPageSection title={"Settings"}  Icon={Settings}>
                    <GroupPageSettings isPremium={user.premium} groupId={calendarGroup.id} syncEnabled={calendarGroup.settings?.syncEnabled } nameDuplicationEnabled={calendarGroup.settings?.nameDuplicationEnabled} syncFrequencyMinutes={calendarGroup.settings?.syncFrequencyMinutes} />
                </GroupPageSection>
                <GroupPageSection title={"Synchronization logs"} Icon={ClipboardList}>
                    <GroupPageLogs groupId={calendarGroup.id}/>
                </GroupPageSection>
                <GroupPageSection title={"Danger Zone"} Icon={TriangleAlert} className={"border-destructive/30"}>
                    <GroupPageDangerZone groupId={calendarGroup.id} groupName={calendarGroup.name} />
                </GroupPageSection>
            </div>
        </div>
    );
}

export default Page;