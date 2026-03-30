import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import {getCurrentUser} from "@/lib/authUser";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Monitor your calendar sync activity and manage integrations.",
};

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) return;

    const groups = await prisma.calendarGroup.findMany({
        where: { userId: user.id },
        include: {
            primaryCalendar: true,
            calendars: true,
            settings: true,
            _count: {
                select: { syncLogs: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    const recentLogs = await prisma.syncLog.findMany({
        where: { userId: user.id },
        include: {
            group: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    const totalGroups = await prisma.calendarGroup.count({
        where: { userId: user.id }
    });

    const totalSyncs = await prisma.syncLog.count({
        where: { userId: user.id }
    });

    const successfulSyncs = await prisma.syncLog.count({
        where: { userId: user.id, status: 'success' }
    });

    const failedSyncs = await prisma.syncLog.count({
        where: { userId: user.id, status: 'failed' }
    });

    const successRate = totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 0;

    return (
        <div className="min-h-screen p-6 max-w-7xl mx-auto">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Overview</h1>
                <p className="text-muted-foreground">
                    Monitor and manage your calendar synchronization
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calendar Groups</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalGroups}</div>
                        <p className="text-xs text-muted-foreground">Active groups</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSyncs}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate}%</div>
                        <p className="text-xs text-muted-foreground">{successfulSyncs} successful</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{failedSyncs}</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Groups</CardTitle>
                                <CardDescription>Your most recent calendar groups</CardDescription>
                            </div>
                            <Link href="/dashboard/calendars/groups">
                                <Button variant="ghost" size="sm">
                                    View All
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {groups.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No calendar groups yet</p>
                                <Link href="/dashboard/calendars/groups">
                                    <Button size="sm">Create Your First Group</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {groups.map((group, index) => (
                                    <div key={group.id}>
                                        <Link href={`/dashboard/calendars/groups/${group.id}`}>
                                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium">{group.name}</h3>
                                                        {group.settings?.syncEnabled && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {group.calendars.length} secondary calendar{group.calendars.length !== 1 ? 's' : ''} • {group._count.syncLogs} syncs
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </Link>
                                        {index < groups.length - 1 && <Separator className="my-2" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest sync operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No sync activity yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentLogs.map((log, index) => {
                                    const statusVariants = {
                                        success: 'default',
                                        failed: 'destructive',
                                        partial: 'secondary',
                                        running: 'outline',
                                    };
                                    return (
                                        <div key={log.id}>
                                            <Link href={`/dashboard/calendars/logs/${log.id}`}>
                                                <div className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{log.group.name}</span>
                                                            <Badge variant={statusVariants[log.status as keyof typeof statusVariants] as any} className="text-xs capitalize">
                                                                {log.status}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        {log.eventsAdded > 0 && (
                                                            <span className="text-emerald-600">+{log.eventsAdded} added</span>
                                                        )}
                                                        {log.eventsDeleted > 0 && (
                                                            <span className="text-red-600">−{log.eventsDeleted} deleted</span>
                                                        )}
                                                        {log.eventsFailed > 0 && (
                                                            <span className="text-orange-600">⚠ {log.eventsFailed} failed</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                            {index < recentLogs.length - 1 && <Separator className="my-2" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}