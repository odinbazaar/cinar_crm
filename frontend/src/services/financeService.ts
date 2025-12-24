import apiClient from './api';

export interface FinanceStats {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    margin: string;
}

export interface MonthlyData {
    name: string;
    butce: number;
    harcanan: number;
}

export interface Transaction {
    id: string;
    title: string;
    type: 'income' | 'expense';
    amount: number;
    date: string;
    category: string;
}

export interface DashboardData {
    stats: FinanceStats;
    monthlyData: MonthlyData[];
    recentTransactions: Transaction[];
}

export const financeService = {
    async getDashboardData(period: string = 'bu-yil'): Promise<DashboardData> {
        return apiClient.get<DashboardData>(`/finance/dashboard?period=${period}`);
    }
};

export default financeService;
