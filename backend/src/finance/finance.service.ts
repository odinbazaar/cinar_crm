import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';

@Injectable()
export class FinanceService {
    async getDashboardData(period: string) {
        // Fetch Proposals (as Income/Revenue source)
        const { data: proposals, error: proposalsError } = await supabase
            .from('proposals')
            .select('*');

        if (proposalsError) throw new Error(proposalsError.message);

        // Fetch Projects (as Expense source - looking at actual_cost)
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*');

        if (projectsError) throw new Error(projectsError.message);

        // Calculate Totals
        const totalRevenue = proposals.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        // Assuming projects 'actual_cost' is the expense
        const totalExpense = projects.reduce((acc, curr) => acc + (Number(curr.actual_cost) || 0), 0);
        const netProfit = totalRevenue - totalExpense;

        // Group by Month for Charts (Simple implementation using current year)
        const monthlyData = Array(12).fill(0).map((_, i) => {
            const monthName = new Date(0, i).toLocaleString('tr-TR', { month: 'long' });
            return {
                name: monthName,
                butce: 0, // Projected Income
                harcanan: 0 // Actual Expense
            };
        });

        proposals.forEach(p => {
            const date = new Date(p.created_at);
            const month = date.getMonth();
            if (date.getFullYear() === new Date().getFullYear()) {
                monthlyData[month].butce += Number(p.total) || 0;
            }
        });

        projects.forEach(p => {
            const date = new Date(p.created_at); // Or use updated_at / specific expense date
            const month = date.getMonth();
            if (date.getFullYear() === new Date().getFullYear()) {
                monthlyData[month].harcanan += Number(p.actual_cost) || 0;
            }
        });

        // Recent Transactions (Mixing Proposals as 'Income' and Projects as 'Expense')
        const transactions = [
            ...proposals.map(p => ({
                id: p.id,
                title: p.title || 'Teklif',
                type: 'income',
                amount: p.total,
                date: new Date(p.created_at).toLocaleDateString('tr-TR'),
                category: 'Satış'
            })),
            ...projects.map(p => ({
                id: p.id,
                title: p.name || 'Proje Gideri',
                type: 'expense',
                amount: p.actual_cost,
                date: new Date(p.created_at).toLocaleDateString('tr-TR'),
                category: 'Proje'
            }))
        ].sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
            .slice(0, 5); // Take top 5

        return {
            stats: {
                totalRevenue,
                totalExpense,
                netProfit,
                margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0
            },
            monthlyData,
            recentTransactions: transactions
        };
    }
}
