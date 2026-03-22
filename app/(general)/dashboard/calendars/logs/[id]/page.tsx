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
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <ProviderIcon provider={entry.sourceCalendar.provider} />
                                        <span>{entry.sourceCalendar.name}</span>
                                    </div>
                                    <span>→</span>
                                    <div className="flex items-center gap-1.5">
                                        <ProviderIcon provider={entry.targetCalendar.provider} />
                                        <span>{entry.targetCalendar.name}</span>
                                    </div>
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
                                <div className="text-sm text-gray-500 flex gap-2 items-center ">
                                    <ProviderIcon provider={entry.targetCalendar.provider} />
                                    <span>{entry.targetCalendar.name}</span>
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
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <ProviderIcon provider={entry.sourceCalendar.provider} />
                                            <span>{entry.sourceCalendar.name}</span>
                                        </div>
                                        <span>→</span>
                                        <div className="flex items-center gap-1.5">
                                            <ProviderIcon provider={entry.targetCalendar.provider} />
                                            <span>{entry.targetCalendar.name}</span>
                                        </div>
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

const ProviderIcon = ({ provider }: { provider: string }) => {
    const icons = {
        google: (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
        ),
        microsoft: (
            <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f25022" d="M0 0h11v11H0z"/>
                <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                <path fill="#7fba00" d="M0 12h11v11H0z"/>
                <path fill="#ffb900" d="M12 12h11v11H12z"/>
            </svg>
        ),
        apple: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
        ),
    };

    return icons[provider.toLowerCase() as keyof typeof icons] || null;
};

export default Page;