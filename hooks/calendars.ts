import useSWR from "swr";
import {Provider} from "@prisma/client";
import {AccessRole} from "@prisma/client"

interface ProviderCalendarResponse {
    id: string;
    name: string;
    description?: string;
    timeZone?: string;
    primary: boolean;
    accessRole: AccessRole;
    selected: boolean;
}

export function useProviderCalendars(provider: Provider) {
    const {isLoading, error, data} = useSWR<{message : string, data: ProviderCalendarResponse[]}>(`/calendars/${provider}`);


    return {
        isLoading,
        calendars: data?.data ?? [],
        error,
    }
}