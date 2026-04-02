import { useState, useEffect, useMemo } from 'react'
import { 
    Bell, 
    Calendar, 
    DollarSign, 
    Users, 
    Package, 
    CheckCircle, 
    Info, 
    FileText, 
    Loader2, 
    StickyNote, 
    RefreshCw, 
    X, 
    Search,
    Trash2,
    CheckCheck,
    Filter,
    ChevronRight,
    SearchX,
    Clock
} from 'lucide-react'
import { notificationsService } from '../services/notificationsService'
import type { Notification } from '../services/notificationsService'
import { useToast } from '../hooks/useToast'

export default function NotificationsPage() {
    const { success, info, error } = useToast()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const data = await notificationsService.getAll()
            setNotifications(data)
        } catch (err) {
            console.error('Error fetching notifications:', err)
            error('Bildirimler yüklenirken bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 n.message.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesTab = activeTab === 'all' ? true :
                             activeTab === 'unread' ? !n.read : n.read
            const matchesType = typeFilter === 'all' ? true : n.type === typeFilter
            
            return matchesSearch && matchesTab && matchesType
        })
    }, [notifications, searchTerm, activeTab, typeFilter])

    const unreadCount = notifications.filter(n => !n.read).length
    const stats = {
        total: notifications.length,
        unread: unreadCount,
        critical: notifications.filter(n => n.type === 'system' || n.type === 'payment').length
    }

    const markAsRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            success('Bildirim okundu olarak işaretlendi.')
        } catch (err) {
            error('İşlem başarısız oldu.')
        }
    }

    const markAllAsRead = async () => {
        if (!notifications.some(n => !n.read)) return
        try {
            await notificationsService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            success('Tüm bildirimler okundu olarak işaretlendi.')
        } catch (err) {
            error('İşlem başarısız oldu.')
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await notificationsService.delete(id)
            setNotifications(prev => prev.filter(n => n.id !== id))
            info('Bildirim silindi.')
        } catch (err) {
            error('Silme işlemi başarısız oldu.')
        }
    }

    const clearAll = async () => {
        if (!window.confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) return
        try {
            await notificationsService.clearAll()
            setNotifications([])
            success('Tüm bildirimler temizlendi.')
        } catch (err) {
            error('Temizleme işlemi başarısız oldu.')
        }
    }

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'reservation': return <Calendar className="w-5 h-5 text-blue-600" />
            case 'payment': return <DollarSign className="w-5 h-5 text-green-600" />
            case 'client': return <Users className="w-5 h-5 text-purple-600" />
            case 'inventory': return <Package className="w-5 h-5 text-orange-600" />
            case 'proposal': return <FileText className="w-5 h-5 text-indigo-600" />
            case 'note': return <StickyNote className="w-5 h-5 text-amber-600" />
            case 'system': return <Info className="w-5 h-5 text-red-600" />
            default: return <Bell className="w-5 h-5 text-gray-600" />
        }
    }

    const getNotificationBgColor = (type: Notification['type']) => {
        switch (type) {
            case 'reservation': return 'bg-blue-50 border-blue-100'
            case 'payment': return 'bg-green-50 border-green-100'
            case 'client': return 'bg-purple-50 border-purple-100'
            case 'inventory': return 'bg-orange-50 border-orange-100'
            case 'proposal': return 'bg-indigo-50 border-indigo-100'
            case 'note': return 'bg-amber-50 border-amber-100'
            case 'system': return 'bg-red-50 border-red-100'
            default: return 'bg-gray-50 border-gray-100'
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
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-7 h-7 text-primary-600" />
                        Bildirim Merkezi
                    </h1>
                    <p className="text-gray-500 mt-1">Sistem ve kullanıcı bildirimlerini buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllAsRead}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <CheckCheck className="w-4 h-4 text-green-600" />
                        Tümünü Oku
                    </button>
                    <button
                        onClick={clearAll}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Tümünü Temizle
                    </button>
                    <button
                        onClick={fetchNotifications}
                        className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Toplam Bildirim</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.total}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Okunmamış</p>
                            <h3 className="text-2xl font-black text-primary-600 mt-1">{stats.unread}</h3>
                        </div>
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                            <Info className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Kritik / Finans</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.critical}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Bildirimlerde ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Tümü
                                </button>
                                <button
                                    onClick={() => setActiveTab('unread')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'unread' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Okunmamış
                                </button>
                                <button
                                    onClick={() => setActiveTab('read')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'read' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Okunmuş
                                </button>
                            </div>
                            
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                            >
                                <option value="all">Tüm Kategoriler</option>
                                <option value="reservation">Rezervasyon</option>
                                <option value="payment">Ödeme / Finans</option>
                                <option value="client">Müşteri</option>
                                <option value="inventory">Envanter</option>
                                <option value="proposal">Teklif</option>
                                <option value="system">Sistem</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                                <Bell className="absolute inset-0 m-auto w-6 h-6 text-primary-600" />
                            </div>
                            <p className="mt-4 text-gray-500 font-medium animate-pulse">Bildirimler hazırlanıyor...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((n, idx) => (
                                <div 
                                    key={n.id} 
                                    className={`group p-6 flex flex-col md:flex-row gap-5 transition-all hover:bg-blue-50/20 relative ${!n.read ? 'bg-primary-50/30' : ''}`}
                                    onClick={() => !n.read && markAsRead(n.id)}
                                >
                                    {/* Unread Indicator dot */}
                                    {!n.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600" />
                                    )}

                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border-2 ${getNotificationBgColor(n.type)}`}>
                                        {getNotificationIcon(n.type)}
                                    </div>
                                    
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className={`text-lg transition-colors ${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                                    {n.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getNotificationBgColor(n.type)}`}>
                                                        {n.type}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(n.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                {!n.read && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                                                        title="Okundu Say"
                                                    >
                                                        <CheckCheck className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className={`text-gray-600 leading-relaxed max-w-4xl ${!n.read ? 'font-medium' : 'font-normal'}`}>
                                            {n.message}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-end md:justify-center">
                                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary-400 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                {searchTerm ? <SearchX className="w-10 h-10 text-gray-300" /> : <Bell className="w-10 h-10 text-gray-300" />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {searchTerm ? 'Sonuç Bulunamadı' : 'Harika! Hiç Bildirim Yok'}
                            </h3>
                            <p className="text-gray-500 mt-2 max-w-xs">
                                {searchTerm ? `"${searchTerm}" araması için herhangi bir sonuç bulunamadı.` : 'Bütün işler yolunda görünüyor, yeni bildirimler burada görünecek.'}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="mt-6 text-primary-600 font-bold hover:underline"
                                >
                                    Aramayı Temizle
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Design Note Artifact Tip? No, just the UI is enough. */}
        </div>
    )
}
