export interface NotificationDTO {
    id: string;
    type: NotificationType;
    title: string;
    message: string | null;
    link: string | null;
    read: boolean;
    createdAt: string;
}