import useSWR from "swr";
import {Provider} from "@prisma/client";
import {ProviderCalendarResponse} from "@/types/calendar";
import {buildQueryString} from "@/lib/utils";

export function useProviderCalendars(provider: Provider, params?: { used?: boolean; owner?: boolean }) {

    const queryString = buildQueryString(params);
    const {isLoading, error, data, mutate} = useSWR<{message : string, data: ProviderCalendarResponse[]}>(`/calendars/provider/${provider}${queryString}`);

    return {
        isLoading,
        calendars: data?.data ?? [],
        error: error ? error.message : null,
        mutate
    }
}


export function useAllProviderCalendars(providers : Provider[], params?: { used?: boolean; owner?: boolean }) {
    return {
        google: providers.includes("google") ? useProviderCalendars("google", params) : { calendars: [], isLoading: false, error: null, mutate: () => {} },
        apple: providers.includes("apple") ? useProviderCalendars("apple", params) : { calendars: [], isLoading: false, error: null, mutate: () => {} },
        microsoft: providers.includes("microsoft") ? useProviderCalendars("microsoft", params) : { calendars: [], isLoading: false, error: null, mutate: () => {} },
    }
}