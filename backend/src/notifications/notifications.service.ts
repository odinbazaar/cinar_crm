import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { Notification, CreateNotificationDto, UpdateNotificationDto } from './notifications.dto';

@Injectable()
export class NotificationsService {
    async findAll(userId?: string): Promise<Notification[]> {
        let query = supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        // Eğer userId varsa, o kullanıcıya ait veya herkese açık bildirimleri getir
        if (userId) {
            query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            throw new Error(error.message);
        }
        return data as Notification[];
    }

    async getUnreadCount(userId?: string): Promise<number> {
        let query = supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('read', false);

        if (userId) {
            query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }

        const { count, error } = await query;

        if (error) {
            console.error('Error counting unread notifications:', error);
            return 0;
        }
        return count || 0;
    }

    async create(dto: CreateNotificationDto): Promise<Notification> {
        const { data, error } = await supabase
            .from('notifications')
            .insert([dto])
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            throw new Error(error.message);
        }
        return data as Notification;
    }

    async markAsRead(id: string): Promise<Notification> {
        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Notification;
    }

    async markAllAsRead(userId?: string): Promise<void> {
        let query = supabase
            .from('notifications')
            .update({ read: true })
            .eq('read', false);

        if (userId) {
            query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }

        const { error } = await query;
        if (error) throw new Error(error.message);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    // Yardımcı metod: Sistem olaylarında bildirim oluştur
    async createSystemNotification(
        type: CreateNotificationDto['type'],
        title: string,
        message: string,
        relatedId?: string,
        relatedType?: string
    ): Promise<Notification> {
        return this.create({
            type,
            title,
            message,
            related_id: relatedId,
            related_type: relatedType,
        });
    }
}
