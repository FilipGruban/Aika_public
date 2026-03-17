"use client"
import React from 'react';
import {useSyncLogs} from "@/hooks/logs";
import {Button} from "@/components/ui/button";
import {SyncLogCard} from "@/components/SyncLog";

interface GroupPageLogsProps {
    groupId: string;

}

function GroupPageLogs({groupId}:GroupPageLogsProps) {
    const { logs, isLoading, hasMore, isLoadingMore, loadMore } = useSyncLogs(groupId);

    if (isLoading) {
        return <div className={"text-muted-foreground text-center"}>Loading logs...</div>;
    }

    return (
        <div className={"space-y-4"}>

            {logs.map((log) => (
                <SyncLogCard log={log} groupId={groupId} key={log.id}/>
            ))}

            {hasMore && (
                <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="w-full"
                >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                </Button>
            )}

            {logs.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-8">
                    No sync logs yet
                </div>
            )}
        </div>
    );
}

export default GroupPageLogs;