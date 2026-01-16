import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    FileText,
    LogOut,
    Bell,
    Settings,
    Menu,
    X,
    MapPin,
    Calendar,
    ClipboardList,
    ShoppingBag,
    CalendarDays,
    Calculator,
    FileSignature
} from 'lucide-react'
import { useState } from 'react'
import NotificationsPanel from './NotificationsPanel'

interface MainLayoutProps {
    onLogout: () => void
}

const navigation = [
    { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Satış', href: '/sales', icon: ShoppingBag },
    { name: 'Rezervasyon', href: '/reservations', icon: CalendarDays },
    { name: 'Maliyet Ayarları', href: '/cost-settings', icon: Calculator },
    { name: 'Envanter', href: '/inventory', icon: MapPin },
    { name: 'Asım Listesi', href: '/asim-listesi', icon: Calendar },
    { name: 'Teklifler', href: '/proposals', icon: FileText },
    { name: 'Sözleşmeler', href: '/contracts', icon: FileSignature },
]


export default function MainLayout({ onLogout }: MainLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">Ç</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Çınar CRM</h1>
                            <p className="text-xs text-gray-500">Reklam Ajansı</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 custom-scrollbar overflow-y-auto" style={{ height: 'calc(100vh - 8rem)' }}>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">AD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                            <p className="text-xs text-gray-500 truncate">admin@cinar.com</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="h-full px-4 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="flex-1 lg:flex-none" />

                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button
                                onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
                                className={`relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${notificationsPanelOpen ? 'bg-gray-100 text-gray-700' : ''
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            </button>

                            {/* Settings */}
                            <button
                                onClick={() => navigate('/settings')}
                                className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${location.pathname === '/settings' ? 'bg-gray-100 text-gray-700' : ''
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Notifications Panel */}
                        <NotificationsPanel
                            isOpen={notificationsPanelOpen}
                            onClose={() => setNotificationsPanelOpen(false)}
                        />
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
