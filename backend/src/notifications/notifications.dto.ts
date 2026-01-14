export interface Notification {
    id: string;
    type: 'reservation' | 'payment' | 'client' | 'inventory' | 'system' | 'proposal';
    title: string;
    message: string;
    user_id?: string;
    related_id?: string;
    related_type?: string;
    read: boolean;
    created_at: string;
}

export interface CreateNotificationDto {
    type: 'reservation' | 'payment' | 'client' | 'inventory' | 'system' | 'proposal';
    title: string;
    message: string;
    user_id?: string;
    related_id?: string;
    related_type?: string;
}

export interface UpdateNotificationDto {
    read?: boolean;
}
