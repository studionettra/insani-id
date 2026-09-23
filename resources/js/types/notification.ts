export type NotificationData = {
    title: string;
    message: string;
    url?: string;
    category?: 'disbursement' | 'campaigner' | 'contact' | string;
    icon?: string;
    id_reference?: number | string;
};

export type AppNotification = {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    created_at_iso?: string;
};

export type NotificationPayload = {
    unread_count: number;
    recent: AppNotification[];
};
