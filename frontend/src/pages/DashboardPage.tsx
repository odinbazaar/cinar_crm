import {
    TrendingUp,
    Users,
    FolderKanban,
    DollarSign,
    ArrowUp,
    ArrowDown,
    Clock,
    CheckCircle,
    MapPin,
    Calendar
} from 'lucide-react'
import { getInventoryStats, mockBookings, mockInventory } from '../services/mockData'

export default function DashboardPage() {
    const inventoryStats = getInventoryStats()

    const stats = [
        {
            name: 'Toplam Gelir',
            value: '₺2,847,500',
            change: '+12.5%',
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            name: 'Envanter Doluluk',
            value: `%${inventoryStats.occupancy}`,
            change: '+5%',
            changeType: 'increase',
            icon: MapPin,
            color: 'bg-blue-500',
        },
        {
            name: 'Aktif Rezervasyon',
            value: mockBookings.filter(b => b.status === 'CONFIRMED').length.toString(),
            change: '+8',
            changeType: 'increase',
            icon: Calendar,
            color: 'bg-purple-500',
        },
        {
            name: 'Ortalama Kârlılık',
            value: '%32.5',
            change: '+2.1%',
            changeType: 'increase',
            icon: TrendingUp,
            color: 'bg-orange-500',
        },
    ]

    const recentBookings = mockBookings.slice(0, 5).map(booking => {
        const item = mockInventory.find(i => i.id === booking.inventoryItemId)
        return {
            ...booking,
            itemCode: item?.code,
            itemAddress: item?.address,
            itemType: item?.type
        }
    })

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Çınar Reklam Ajansı genel performans özeti</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
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
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings / Projects */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Son Rezervasyonlar</h2>
                        <a href="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Tümünü Gör →
                        </a>
                    </div>
                    <div className="space-y-4">
                        {recentBookings.map((booking) => (
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
                                        <p className="text-sm font-medium text-gray-900">{booking.startDate}</p>
                                        <p className="text-xs text-gray-500">{booking.endDate}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory Summary */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Envanter Durumu</h2>
                        <a href="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Detaylar →
                        </a>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-blue-600">BB</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Billboard</p>
                                    <p className="text-xs text-gray-500">{mockInventory.filter(i => i.type === 'BB').length} Adet</p>
                                </div>
                            </div>
                            <span className="badge badge-success">Aktif</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-purple-600">CLP</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Raket / Durak</p>
                                    <p className="text-xs text-gray-500">{mockInventory.filter(i => i.type === 'CLP').length} Adet</p>
                                </div>
                            </div>
                            <span className="badge badge-success">Aktif</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-orange-600">GB</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Giant Board</p>
                                    <p className="text-xs text-gray-500">{mockInventory.filter(i => i.type === 'GB').length} Adet</p>
                                </div>
                            </div>
                            <span className="badge badge-success">Aktif</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-red-600">MGL</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Megalight</p>
                                    <p className="text-xs text-gray-500">{mockInventory.filter(i => i.type === 'MGL').length} Adet</p>
                                </div>
                            </div>
                            <span className="badge badge-success">Aktif</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
