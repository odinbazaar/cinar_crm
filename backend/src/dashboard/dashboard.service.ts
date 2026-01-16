import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';

@Injectable()
export class DashboardService {
    async getStats() {
        // 1. Total Revenue (from accepted proposals)
        const { data: proposals } = await supabase
            .from('proposals')
            .select('total')
            .eq('status', 'ACCEPTED');

        const totalRevenue = proposals?.reduce((sum, p) => sum + Number(p.total), 0) || 0;

        // 2. Inventory Occupancy
        const { count: totalItems } = await supabase
            .from('inventory_items')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        const today = new Date().toISOString();
        const { count: occupiedItems } = await supabase
            .from('bookings')
            .select('inventory_item_id', { count: 'exact', head: true })
            .lte('start_date', today)
            .gte('end_date', today)
            .eq('status', 'CONFIRMED');

        const occupancy = totalItems ? Math.round((Number(occupiedItems) / Number(totalItems)) * 100) : 0;

        // 3. Active Bookings
        const { count: activeBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .gte('end_date', today)
            .not('status', 'eq', 'CANCELLED');

        // 4. Avg Profitability (Mock for now or 32% default)
        const avgProfitability = 32.5;

        // 5. Recent Bookings
        const { data: recentBookingsData } = await supabase
            .from('bookings')
            .select(`
                *,
                clients (name),
                inventory_items (code, type, address)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        const recentBookings = recentBookingsData?.map(b => ({
            id: b.id,
            clientName: b.clients?.name || 'Bilinmeyen Müşteri',
            itemCode: b.inventory_items?.code,
            itemType: b.inventory_items?.type,
            itemAddress: b.inventory_items?.address,
            status: b.status,
            startDate: b.start_date,
            endDate: b.end_date
        })) || [];

        // 6. Inventory Breakdown
        const { data: inventoryData } = await supabase
            .from('inventory_items')
            .select('type');

        const types = ['BB', 'CLP', 'GB', 'MGL'];
        const inventoryBreakdown = types.map(type => ({
            type,
            name: type === 'BB' ? 'Billboard' :
                type === 'CLP' ? 'Raket / Durak' :
                    type === 'GB' ? 'Giant Board' : 'Megalight',
            count: inventoryData?.filter(i => i.type === type).length || 0
        }));

        return {
            stats: [
                { name: 'Toplam Gelir', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, change: '+0%', changeType: 'increase', icon: 'DollarSign', color: 'bg-green-500' },
                { name: 'Envanter Doluluk', value: `%${occupancy}`, change: '+0%', changeType: 'increase', icon: 'MapPin', color: 'bg-blue-500' },
                { name: 'Aktif Rezervasyon', value: activeBookings?.toString() || '0', change: '+0', changeType: 'increase', icon: 'Calendar', color: 'bg-purple-500' },
                { name: 'Ortalama Kârlılık', value: `%${avgProfitability}`, change: '+0%', changeType: 'increase', icon: 'TrendingUp', color: 'bg-orange-500' },
            ],
            recentBookings,
            inventoryBreakdown
        };
    }
}
