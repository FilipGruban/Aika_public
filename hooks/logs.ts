import {LogsResponse} from "@/types/log";
import useSWRInfinite from "swr/infinite";

export function useSyncLogs(groupId: string) {
    const getKey = (pageIndex: number, previousPageData: LogsResponse | null) => {
        if (previousPageData && !previousPageData.hasMore) return null;

        if (pageIndex === 0) {
            return `calendars/groups/${groupId}/logs?limit=5`;
        }

        return `calendars/groups/${groupId}/logs?limit=5&cursor=${previousPageData!.nextCursor}`;
    };

    const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<LogsResponse>(
        getKey,
        {
            revalidateFirstPage: false,
            revalidateIfStale: true,
        }
    );

    const logs = data ? data.flatMap((page) => page.logs) : [];
    const hasMore = data ? data[data.length - 1]?.hasMore : false;
    const isLoadingMore = isValidating && data && typeof data[size - 1] !== 'undefined';

    return {
        logs,
        isLoading,
        isError: error,
        hasMore,
        isLoadingMore,
        loadMore: () => setSize(size + 1),
    };
}