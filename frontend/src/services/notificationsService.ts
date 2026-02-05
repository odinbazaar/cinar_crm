import apiClient from './api';

export interface Notification {
    id: string;
    type: 'reservation' | 'payment' | 'client' | 'inventory' | 'system' | 'proposal' | 'note';
    title: string;
    message: string;
    user_id?: string;
    related_id?: string;
    related_type?: string;
    read: boolean;
    created_at: string;
}

export interface CreateNotificationDto {
    type: Notification['type'];
    title: string;
    message: string;
    user_id?: string;
    related_id?: string;
    related_type?: string;
}

export interface UpdateNotificationDto extends Partial<CreateNotificationDto> {
    read?: boolean;
}

export const notificationsService = {
    async getAll(userId?: string): Promise<Notification[]> {
        const url = userId ? `/notifications?userId=${userId}` : '/notifications';
        return apiClient.get<Notification[]>(url);
    },

    async getUnreadCount(userId?: string): Promise<number> {
        const url = userId ? `/notifications/unread-count?userId=${userId}` : '/notifications/unread-count';
        const result = await apiClient.get<{ count: number }>(url);
        return result.count;
    },

    async create(data: CreateNotificationDto): Promise<Notification> {
        return apiClient.post<Notification>('/notifications', data);
    },

    async markAsRead(id: string): Promise<Notification> {
        return apiClient.put<Notification>(`/notifications/${id}/read`);
    },

    async markAllAsRead(userId?: string): Promise<void> {
        const url = userId ? `/notifications/read-all?userId=${userId}` : '/notifications/read-all';
        await apiClient.put<{ success: boolean }>(url);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete<{ success: boolean }>(`/notifications/${id}`);
    },
};

export default notificationsService;
