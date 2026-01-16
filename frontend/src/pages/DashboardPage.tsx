import {
    TrendingUp,
    DollarSign,
    ArrowUp,
    ArrowDown,
    MapPin,
    Calendar,
    Loader2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services'

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
                <p className="text-gray-600 mt-1">Çınar Reklam Ajansı genel performans özeti</p>
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
