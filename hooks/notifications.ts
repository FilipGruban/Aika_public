import useSWR from "swr";
import {NotificationDTO} from "@/types/notification";

export function useNotifications() {
    const {data, isLoading, error} = useSWR<{message: string, data: NotificationDTO[]}>('/notifications', {
        refreshInterval: 50000,
    });

    return{
        notifications: data?.data ?? [],
        isLoading,
        error,
    }

}