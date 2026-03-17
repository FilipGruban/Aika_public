import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {SyncLog} from "@/types/log";

type SyncLogCardProps = {
    log: SyncLog;
    groupId: string;
};

export function SyncLogCard({ log, groupId }: SyncLogCardProps) {
    const statusConfig = {
        success: {
            icon: CheckCircle2,
            color: 'text-emerald-600',
            dotColor: 'bg-emerald-500',
        },
        failed: {
            icon: XCircle,
            color: 'text-red-600',
            dotColor: 'bg-red-500',
        },
        partial: {
            icon: XCircle,
            color: 'text-orange-600',
            dotColor: 'bg-orange-500',
        },
        running: {
            icon: Clock,
            color: 'text-blue-600',
            dotColor: 'bg-blue-500',
        },
    };

    const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.running;
    const StatusIcon = config.icon;

    return (
        <Link href={`/dashboard/calendars/logs/${log.id}`}>
            <div className="group rounded-xl border border-gray-200 p-2 my-2 cursor-pointer">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className={cn('p-2.5 rounded-lg bg-gray-50', config.color)}>
                            <StatusIcon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                    {log.triggeredBy === 'manual' ? 'Manual' : 'Automatic'} Sync
                                </h3>
                                <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
                                <span className="text-xs text-gray-500 capitalize">{log.status}</span>
                            </div>

                            <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-sm">
                                {log.eventsAdded > 0 && (
                                    <span className="text-gray-600">
                    <span className="font-medium text-emerald-600">+{log.eventsAdded}</span> added
                  </span>
                                )}
                                {log.eventsDeleted > 0 && (
                                    <span className="text-gray-600">
                    <span className="font-medium text-red-600">−{log.eventsDeleted}</span> deleted
                  </span>
                                )}
                                {log.eventsFailed > 0 && (
                                    <span className="text-gray-600">
                    <span className="font-medium text-orange-600">⚠ {log.eventsFailed}</span> failed
                  </span>
                                )}
                            </div>

                            {log.error && (
                                <p className="mt-2 text-sm text-red-600 line-clamp-2 bg-red-50 rounded-lg p-2">
                                    {log.error}
                                </p>
                            )}
                        </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
            </div>
        </Link>
    );
}