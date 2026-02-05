import {
    TrendingUp,
    DollarSign,
    ArrowUp,
    ArrowDown,
    MapPin,
    Calendar,
    Loader2,
    Bell,
    StickyNote,
    Clock
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services'
import { notificationsService } from '../services/notificationsService'
import type { Notification } from '../services/notificationsService'

const iconMap: Record<string, any> = {
    DollarSign,
    MapPin,
    Calendar,
    TrendingUp
};

export default function DashboardPage() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardService.getStats
    });

    const { data: notifications } = useQuery({
        queryKey: ['recent-reminders'],
        queryFn: () => notificationsService.getAll()
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    const { stats, recentBookings, inventoryBreakdown } = dashboardData || {
        stats: [],
        recentBookings: [],
        inventoryBreakdown: []
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">İzmir Açıkhava Reklam Ajansı genel performans özeti</p>
            </div>

            {/* Announcements & Reminders */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-amber-900">Duyurular ve Hatırlatıcılar</h2>
                            <p className="text-sm text-amber-700/70">Müşteri notlarından otomatik oluşturulan hatırlatıcılar</p>
                        </div>
                    </div>
                    <a href="/notifications" className="text-sm text-amber-700 hover:text-amber-900 font-bold bg-white/50 px-4 py-2 rounded-lg border border-amber-200 transition-all">
                        Tüm Bildirimler
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                        const reminders = notifications?.filter(n => n.type === 'note' || n.type === 'system').slice(0, 3) || [];

                        if (reminders.length === 0) {
                            return (
                                <div className="col-span-full py-8 text-center bg-white/50 rounded-xl border border-dashed border-amber-200">
                                    <StickyNote className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                                    <p className="text-amber-600 text-sm font-medium">Şu an aktif bir duyuru veya hatırlatıcı bulunmuyor.</p>
                                </div>
                            );
                        }

                        return reminders.map(reminder => (
                            <div key={reminder.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex gap-3 group hover:border-amber-300 transition-all cursor-pointer">
                                <div className="mt-1">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-amber-900 text-sm truncate">{reminder.title}</h3>
                                        {!reminder.read && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>}
                                    </div>
                                    <p className="text-xs text-amber-800 line-clamp-2 leading-relaxed mb-2">{reminder.message}</p>
                                    <div className="text-[10px] text-amber-600/60 font-medium">
                                        {new Date(reminder.created_at).toLocaleString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = iconMap[stat.icon] || TrendingUp;
                    return (
                        <div key={stat.name} className="card card-hover">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        {stat.changeType === 'increase' ? (
                                            <ArrowUp className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <ArrowDown className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-gray-500">bu ay</span>
                                    </div>
                                </div>
                                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Son Rezervasyonlar</h2>
                        <a href="/reservations" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Tümünü Gör →
                        </a>
                    </div>
                    <div className="space-y-4">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-info">{booking.itemType} - {booking.itemCode}</span>
                                                <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' :
                                                    booking.status === 'OPTION' ? 'badge-warning' :
                                                        'badge-danger'
                                                    }`}>
                                                    {booking.status === 'CONFIRMED' ? 'Kesin' :
                                                        booking.status === 'OPTION' ? 'Opsiyonlu' :
                                                            'İptal'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{booking.itemAddress}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(booking.startDate).toLocaleDateString('tr-TR')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">Henüz rezervasyon bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inventory Summary */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Envanter Durumu</h2>
                        <a href="/inventory" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Detaylar →
                        </a>
                    </div>
                    <div className="space-y-4">
                        {inventoryBreakdown.map((item) => (
                            <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'BB' ? 'bg-blue-100 text-blue-600' :
                                        item.type === 'CLP' ? 'bg-purple-100 text-purple-600' :
                                            item.type === 'GB' ? 'bg-orange-100 text-orange-600' :
                                                'bg-red-100 text-red-600'
                                        }`}>
                                        <span className="font-bold">{item.type}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.count} Adet</p>
                                    </div>
                                </div>
                                <span className="badge badge-success">Aktif</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
