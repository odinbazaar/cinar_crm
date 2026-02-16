import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import supabase from '../config/supabase.config';

export interface SystemLog {
    id?: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    module: string;
    message: string;
    details?: string;
    user_id?: string;
    user_name?: string;
    created_at?: string;
}

@Injectable()
export class LogsService {
    async createLog(log: Omit<SystemLog, 'id' | 'created_at'>): Promise<SystemLog | null> {
        const { data, error } = await supabase
            .from('system_logs')
            .insert([log])
            .select()
            .single();

        if (error) {
            console.error('Failed to create log:', error);
            return null;
        }
        return data as SystemLog;
    }

    async findAll(): Promise<SystemLog[]> {
        const { data, error } = await supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return (data || []) as SystemLog[];
    }

    async clearLogs(): Promise<void> {
        const { error } = await supabase
            .from('system_logs')
            .delete()
            .not('id', 'is', null);

        if (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
