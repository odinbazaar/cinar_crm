import api from './api';

export interface SystemLog {
    id: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    module: string;
    message: string;
    details?: string;
    user_id?: string;
    user_name?: string;
    created_at: string;
}

export const logsService = {
    getAll: async (): Promise<SystemLog[]> => {
        return api.get<SystemLog[]>('/logs');
    },

    create: async (log: Omit<SystemLog, 'id' | 'created_at'>): Promise<SystemLog> => {
        return api.post<SystemLog>('/logs', log);
    },

    clear: async (): Promise<void> => {
        await api.delete('/logs/clear');
    }
};
