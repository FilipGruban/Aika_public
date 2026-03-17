

export interface EventDTO {
    providerEventId: string;
    calendarId: string;
    title: string;
    description: string | null;
    location: string | null;
    startTime: Date;
    endTime: Date;
    isAllDay: boolean;
    recurrenceRule: string | null;
    status: string;
}

export type EventSyncResult = {
    success: Array<{
        eventTitle: string;
        targetCalendarId: string;
        details?: any;
    }>;
    failed: Array<{
        eventTitle: string;
        targetCalendarId: string;
        error: string;
    }>;
};
