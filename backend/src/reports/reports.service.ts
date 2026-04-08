import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';

@Injectable()
export class ReportsService {
    async getWeeklyStats() {
        const now = new Date();
        const start = new Date();
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);

        const startISO = start.toISOString();
        const nowISO = now.toISOString();

        // 1. New Customers (Last 7 Days)
        const { count: newCustomers } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startISO)
            .lte('created_at', nowISO);

        // 2. Revenue from accepted proposals (Last 7 Days)
        const { data: weeklyProposals } = await supabase
            .from('proposals')
            .select('total')
            .eq('status', 'ACCEPTED')
            .gte('updated_at', startISO)
            .lte('updated_at', nowISO);

        const weeklyRevenue = weeklyProposals?.reduce((sum, p) => sum + Number(p.total), 0) || 0;

        // 3. Occupancy Rate (Today)
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const todayEnd = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('inventory_items(type)')
            .lte('start_date', todayEnd)
            .gte('end_date', todayStart)
            .eq('status', 'KESİN');

        const { count: totalInventory } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true });

        // 4. Breakdown by type
        const { data: allInventory } = await supabase
            .from('inventory_items')
            .select('type');

        const breakdown: Record<string, { total: number; occupied: number }> = {};
        allInventory?.forEach(item => {
            if (!breakdown[item.type]) {
                breakdown[item.type] = { total: 0, occupied: 0 };
            }
            breakdown[item.type].total++;
        });

        activeBookings?.forEach((b: any) => {
            const type = b.inventory_items?.type;
            if (type && breakdown[type]) {
                breakdown[type].occupied++;
            }
        });

        const activeCount = activeBookings?.length || 0;
        const totalCount = totalInventory || 0;
        const occupancyRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

        return {
            period: {
                start: start,
                end: now
            },
            stats: {
                newCustomers: newCustomers || 0,
                weeklyRevenue,
                occupancyRate,
                totalInventory: totalCount || 0,
                activeBookings: activeCount || 0
            },
            breakdown
        };
    }

    async getEmployeeReports(userId?: string) {
        let query = supabase
            .from('employee_reports')
            .select(`
                *,
                user:users!user_id(first_name, last_name, email),
                reviewer:users!reviewed_by(first_name, last_name)
            `)
            .order('week_starting', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    }

    async submitEmployeeReport(userId: string, weekStarting: string, content: string) {
        const { data, error } = await supabase
            .from('employee_reports')
            .upsert({
                user_id: userId,
                week_starting: weekStarting,
                content,
                status: 'SUBMITTED',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,week_starting'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async reviewEmployeeReport(reportId: string, managerId: string, reviewNote: string) {
        const { data, error } = await supabase
            .from('employee_reports')
            .update({
                status: 'REVIEWED',
                review_note: reviewNote,
                reviewed_by: managerId,
                updated_at: new Date().toISOString()
            })
            .eq('id', reportId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}
