import {AccessRole, Provider} from "@prisma/client";

export interface ProviderCalendarResponse {
    providerCalendarId: string;
    name: string;
    timeZone?: string;
    accessRole: AccessRole;
    used?: boolean;
    provider: Provider;
}

export interface CalendarDTO {
    id: string;
    providerCalendarId: string;
    provider: Provider;
    name: string;
    timeZone: string | null;
    accessRole: AccessRole;
    lastSyncedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}