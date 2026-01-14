import { X, Bell, Calendar, DollarSign, Users, Package, CheckCircle, Info, FileText, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { notificationsService } from '../../services/notificationsService'
import type { Notification } from '../../services/notificationsService'

interface NotificationsPanelProps {
    isOpen: boolean
    onClose: () => void
}

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
        case 'proposal':
            return <FileText className="w-5 h-5 text-indigo-600" />
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
        case 'proposal':
            return 'bg-indigo-100'
        case 'system':
            return 'bg-gray-100'
        default:
            return 'bg-gray-100'
    }
}

const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Şimdi'
    if (diffMins < 60) return `${diffMins} dk önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 7) return `${diffDays} gün önce`
    return date.toLocaleDateString('tr-TR')
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const unreadCount = notifications.filter(n => !n.read).length
    const filteredNotifications = filter === 'all' ? notifications : notifications.filter(n => !n.read)

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const data = await notificationsService.getAll()
            setNotifications(data)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await notificationsService.delete(id)
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
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
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 text-primary-600 mx-auto mb-3 animate-spin" />
                            <p className="text-gray-500">Bildirimler yükleniyor...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {filter === 'unread' ? 'Tüm bildirimler okundu' : 'Henüz bildirim yok'}
                            </p>
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
                                                {formatTime(notification.created_at)}
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
                        onClick={fetchNotifications}
                        className="text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                    >
                        Yenile ↻
                    </button>
                </div>
            </div>
        </>
    )
}
