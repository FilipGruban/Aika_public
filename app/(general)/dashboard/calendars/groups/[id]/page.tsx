import {getCurrentUser} from "@/lib/authUser";
import {prisma} from "@/lib/prisma";
import GroupPageHeader from "@/components/GroupPageHeader";
import GroupPageMainCalendar from "@/components/GroupPageMainCalendar";
import GroupPageSecondaryCalendars from "@/components/GroupPageSecondaryCalendars";
import { toProviderCalendarResponse} from "@/lib/utils";
import {getProviders} from "@/lib/user";


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
        }
    })

    if (!calendarGroup) {
        return (
            <div>
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
                <GroupPageMainCalendar name={calendarGroup.primaryCalendar.name} provider={calendarGroup.primaryCalendar.provider} />
                <GroupPageSecondaryCalendars calendars={calendarClient} providers={providers} groupId={calendarGroup.id} />
            </div>
        </div>
    );
}

export default Page;