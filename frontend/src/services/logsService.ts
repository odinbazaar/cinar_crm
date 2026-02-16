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
        const response = await api.get('/logs');
        return response.data;
    },

    create: async (log: Omit<SystemLog, 'id' | 'created_at'>): Promise<SystemLog> => {
        const response = await api.post('/logs', log);
        return response.data;
    },

    clear: async (): Promise<void> => {
        await api.delete('/logs/clear');
    }
};
