import { X, Bell, Calendar, DollarSign, Users, Package, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useState } from 'react'

interface Notification {
    id: string
    type: 'reservation' | 'payment' | 'client' | 'inventory' | 'system'
    title: string
    message: string
    time: string
    read: boolean
}

interface NotificationsPanelProps {
    isOpen: boolean
    onClose: () => void
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'reservation',
        title: 'Yeni Rezervasyon',
        message: 'RADİKAL EĞİTİM için BB-BB0101 rezervasyonu oluşturuldu.',
        time: '5 dk önce',
        read: false
    },
    {
        id: '2',
        type: 'payment',
        title: 'Ödeme Alındı',
        message: 'MEGA MARKET\'ten ₺125,000 ödeme alındı.',
        time: '1 saat önce',
        read: false
    },
    {
        id: '3',
        type: 'client',
        title: 'Yeni Müşteri',
        message: 'Yeni müşteri kaydı: STAR TEKSTİL A.Ş.',
        time: '2 saat önce',
        read: false
    },
    {
        id: '4',
        type: 'inventory',
        title: 'Envanter Güncellemesi',
        message: 'MG-MG0015 panosu bakım için işaretlendi.',
        time: '3 saat önce',
        read: true
    },
    {
        id: '5',
        type: 'system',
        title: 'Sistem Güncellemesi',
        message: 'Çınar CRM v2.5.0 başarıyla güncellendi.',
        time: '1 gün önce',
        read: true
    },
    {
        id: '6',
        type: 'reservation',
        title: 'Rezervasyon Hatırlatma',
        message: 'DENEME FİRMASI rezervasyonu yarın sona eriyor.',
        time: '1 gün önce',
        read: true
    },
]

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'reservation':
            return <Calendar className="w-5 h-5 text-blue-600" />
        case 'payment':
            return <DollarSign className="w-5 h-5 text-green-600" />
        case 'client':
            return <Users className="w-5 h-5 text-purple-600" />
        case 'inventory':
            return <Package className="w-5 h-5 text-orange-600" />
        case 'system':
            return <Info className="w-5 h-5 text-gray-600" />
        default:
            return <Bell className="w-5 h-5 text-gray-600" />
    }
}

const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
        case 'reservation':
            return 'bg-blue-100'
        case 'payment':
            return 'bg-green-100'
        case 'client':
            return 'bg-purple-100'
        case 'inventory':
            return 'bg-orange-100'
        case 'system':
            return 'bg-gray-100'
        default:
            return 'bg-gray-100'
    }
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
    const [notifications, setNotifications] = useState(mockNotifications)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const unreadCount = notifications.filter(n => !n.read).length
    const filteredNotifications = filter === 'all' ? notifications : notifications.filter(n => !n.read)

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-16 right-4 z-50 w-96 max-h-[calc(100vh-5rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slideDown">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-600" />
                            <h3 className="font-semibold text-gray-900">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === 'all'
                                    ? 'bg-white text-primary-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === 'unread'
                                    ? 'bg-white text-primary-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            Okunmamış ({unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Tüm bildirimler okundu</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary-50/30' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${getNotificationBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {notification.time}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteNotification(notification.id)
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        Tümünü okundu işaretle
                    </button>
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                    >
                        Tüm bildirimleri gör →
                    </button>
                </div>
            </div>
        </>
    )
}
