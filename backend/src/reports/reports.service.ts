import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';

@Injectable()
export class ReportsService {
    async getWeeklyStats() {
        const today = new Date();
        const lastFriday = this.getLastFriday(today);
        const previousFriday = new Date(lastFriday);
        previousFriday.setDate(previousFriday.getDate() - 7);

        const lastFridayISO = lastFriday.toISOString();
        const previousFridayISO = previousFriday.toISOString();

        // 1. New Customers this week
        const { count: newCustomers } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', previousFridayISO)
            .lte('created_at', lastFridayISO);

        // 2. Revenue from accepted proposals this week
        const { data: weeklyProposals } = await supabase
            .from('proposals')
            .select('total')
            .eq('status', 'APPROVED')
            .gte('updated_at', previousFridayISO)
            .lte('updated_at', lastFridayISO);

        const weeklyRevenue = weeklyProposals?.reduce((sum, p) => sum + Number(p.total), 0) || 0;

        // 3. Occupancy Rate (bugün itibariyle aktif KESİN bookinglere göre)
        const todayISO = new Date().toISOString();

        const { count: totalItems } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        const { count: occupiedItems } = await supabase
            .from('bookings')
            .select('inventory_item_id', { count: 'exact', head: true })
            .lte('start_date', todayISO)
            .gte('end_date', todayISO)
            .eq('status', 'KESİN');

        const occupancyRate = totalItems ? Math.round((Number(occupiedItems) / Number(totalItems)) * 100) : 0;

        // 4. Envanter doluluk dağılımı - tip bazında toplam envanter ve dolu ünite sayısı
        const { data: allInventory } = await supabase
            .from('inventory_items')
            .select('type')
            .eq('is_active', true);

        const totalByType: Record<string, number> = {};
        allInventory?.forEach((item: any) => {
            if (item.type) {
                totalByType[item.type] = (totalByType[item.type] || 0) + 1;
            }
        });

        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('inventory_items(type)')
            .lte('start_date', todayISO)
            .gte('end_date', todayISO)
            .eq('status', 'KESİN');

        const occupiedByType: Record<string, number> = {};
        activeBookings?.forEach((b: any) => {
            const type = b.inventory_items?.type;
            if (type) {
                occupiedByType[type] = (occupiedByType[type] || 0) + 1;
            }
        });

        const breakdown: Record<string, { total: number; occupied: number }> = {};
        Object.keys(totalByType).forEach(type => {
            breakdown[type] = {
                total: totalByType[type],
                occupied: occupiedByType[type] || 0
            };
        });

        return {
            period: {
                start: previousFriday,
                end: lastFriday
            },
            stats: {
                newCustomers: newCustomers || 0,
                weeklyRevenue,
                occupancyRate,
                totalInventory: totalItems || 0,
                activeBookings: occupiedItems || 0
            },
            breakdown
        };
    }

    // --- Employee Reports Logic ---

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
        // Upsert logic: if report for this user and this week exists, update it
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

    private getLastFriday(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day <= 5) ? (day + 2) : (day - 5);
        d.setDate(d.getDate() - diff);
        d.setHours(23, 59, 59, 999);
        return d;
    }
}
