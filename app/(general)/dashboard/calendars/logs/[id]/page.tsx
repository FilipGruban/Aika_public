import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {getCurrentUser} from "@/lib/authUser";

async function Page({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();

    if (!user) return;

    const { id } = await params;

    const syncLog = await prisma.syncLog.findUnique({
        where: {
            id,
            userId: user.id
        },
        include: {
            group: true,
            entries: {
                include: {
                    sourceCalendar: true,
                    targetCalendar: true
                },
                orderBy: {
                    createdAt: 'desc',
                }
            }
        }
    });

    if (!syncLog) notFound();

    const statusConfig = {
        success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        partial: { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        running: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    };

    const config = statusConfig[syncLog.status as keyof typeof statusConfig] || statusConfig.running;
    const StatusIcon = config.icon;

    const groupedEntries = {
        added: syncLog.entries.filter(e => e.action === 'added'),
        deleted: syncLog.entries.filter(e => e.action === 'deleted'),
        failed: syncLog.entries.filter(e => e.action === 'failed'),
    };

    return (
        <div className="min-h-screen p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <Link href={`/dashboard/calendars/groups/${syncLog.groupId}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to {syncLog.group.name}
                    </Button>
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${config.bg}`}>
                                <StatusIcon className={`h-6 w-6 ${config.color}`} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {syncLog.triggeredBy === 'manual' ? 'Manual' : 'Automatic'} Sync
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(syncLog.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${config.color} ${config.bg}`}>
                            {syncLog.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{syncLog.eventsAdded}</p>
                            <p className="text-sm text-gray-600">Events Added</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{syncLog.eventsDeleted}</p>
                            <p className="text-sm text-gray-600">Events Deleted</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{syncLog.eventsFailed}</p>
                            <p className="text-sm text-gray-600">Failed</p>
                        </div>
                    </div>

                    {syncLog.error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{syncLog.error}</p>
                        </div>
                    )}
                </div>
            </div>

            {groupedEntries.added.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Events Added ({groupedEntries.added.length})
                    </h2>
                    <div className="space-y-2">
                        {groupedEntries.added.map(entry => (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{entry.eventTitle}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {entry.sourceCalendar.name} → {entry.targetCalendar.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {groupedEntries.deleted.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Events Deleted ({groupedEntries.deleted.length})
                    </h2>
                    <div className="space-y-2">
                        {groupedEntries.deleted.map(entry => (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{entry.eventTitle}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {entry.targetCalendar.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Failed Events */}
            {groupedEntries.failed.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        Failed Events ({groupedEntries.failed.length})
                    </h2>
                    <div className="space-y-2">
                        {groupedEntries.failed.map(entry => (
                            <div key={entry.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Calendar className="w-4 h-4 text-red-400" />
                                        <span className="font-medium text-gray-900">{entry.eventTitle}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {entry.sourceCalendar.name} → {entry.targetCalendar.name}
                                    </div>
                                </div>
                                {entry.error && (
                                    <p className="text-sm text-red-600 ml-7">{entry.error}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;