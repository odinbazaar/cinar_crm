import apiClient from './api';

export interface DashboardStats {
    stats: {
        name: string;
        value: string;
        change: string;
        changeType: 'increase' | 'decrease';
        icon: string;
        color: string;
    }[];
    recentBookings: {
        id: string;
        clientName: string;
        itemCode: string;
        itemType: string;
        itemAddress: string;
        status: string;
        startDate: string;
        endDate: string;
    }[];
    inventoryBreakdown: {
        type: string;
        name: string;
        count: number;
    }[];
}

const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    },
};

export default dashboardService;
