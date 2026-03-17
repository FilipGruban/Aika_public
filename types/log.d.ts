
export type SyncLog = {
    id: string;
    status: string;
    triggeredBy: string;
    eventsAdded: number;
    eventsDeleted: number;
    eventsFailed: number;
    error: string | null;
    createdAt: string;
    completedAt: string | null;
    _count: {
        entries: number;
    };
};

export type LogsResponse = {
    logs: SyncLog[];
    nextCursor: string | null;
    hasMore: boolean;
};