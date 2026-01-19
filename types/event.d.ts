

export interface Event {
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

