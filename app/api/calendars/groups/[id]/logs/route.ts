import {NextRequest, NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {prisma} from "@/lib/prisma";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }){
    try {
        const { id } = await params;

        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message:"Unauthorized"},{status: 401});
        }

        const searchParams = req.nextUrl.searchParams;
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '5');

        const group = await prisma.calendarGroup.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!group) {
            return Response.json({ error: 'Group not found' }, { status: 404 });
        }


        const logs = await prisma.syncLog.findMany({
            where: {
                groupId: id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit + 1,
            ...(cursor && {
                cursor: {
                    id: cursor,
                },
                skip: 1,
            }),
            select: {
                id: true,
                status: true,
                triggeredBy: true,
                eventsAdded: true,
                eventsDeleted: true,
                eventsFailed: true,
                error: true,
                createdAt: true,
                _count: {
                    select: {
                        entries: true,
                    },
                },
            },
        });

        const hasMore = logs.length > limit;
        const items = hasMore ? logs.slice(0, -1) : logs;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return NextResponse.json({message: "Succesfully fetched logs", logs: items, hasMore, nextCursor}, {status:200})
    }
    catch(e){
        console.error(e);
        return NextResponse.json({message: "Something went wrong"}, {status:500});
    }
}