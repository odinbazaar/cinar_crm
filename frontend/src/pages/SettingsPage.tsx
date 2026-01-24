import { useState, useEffect } from 'react'
import {
    User as UserIcon,
    Bell,
    Shield,
    Palette,
    Database,
    Globe,
    Save,
    Check,
    UserPlus,
    Trash2,
    Edit2,
    X,
    Users,
    Lock,
    LogIn,
    Activity
} from 'lucide-react'
import { usersService } from '../services/usersService'
import type { CreateUserDto } from '../services/usersService'
import type { User as UserType } from '../services/authService'

interface SettingSection {
    id: string
    name: string
    icon: typeof UserIcon
}

const sections: SettingSection[] = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'users', name: 'Yetkili Yönetimi', icon: Users },
    { id: 'notifications', name: 'Bildirimler', icon: Bell },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'permissions', name: 'Sayfa Yetkileri', icon: Lock },
    { id: 'login-logs', name: 'Giriş Kayıtları', icon: LogIn },
    { id: 'appearance', name: 'Görünüm', icon: Palette },
    { id: 'data', name: 'Veri Yönetimi', icon: Database },
    { id: 'language', name: 'Dil & Bölge', icon: Globe },
]

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile')
    const [saved, setSaved] = useState(false)

    // Users management
    const [users, setUsers] = useState<UserType[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)
    const [newUser, setNewUser] = useState<any>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'EMPLOYEE',
        phone: '',
        permissions: ['dashboard', 'sales', 'reservations', 'inventory', 'proposals', 'incoming-calls'] // Varsayılan yetkiler
    })
    const [userModalTab, setUserModalTab] = useState<'info' | 'permissions'>('info')

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: 'Admin User',
        email: 'admin@cinar.com',
        phone: '+90 555 123 45 67',
        role: 'Yönetici'
    })

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        reservationAlerts: true,
        paymentAlerts: true,
        weeklyReport: false,
        monthlyReport: true
    })

    // Security settings
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        loginApproval: true, // Varsayılan olarak açık
        sessionTimeout: '24h'
    })

    // Appearance settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        compactMode: false,
        showAnimations: true
    })

    // Page Permission settings
    const [pagePermissions, setPagePermissions] = useState([
        { id: 'dashboard', name: 'Genel Bakış', manager: true, employee: true },
        { id: 'sales', name: 'Satış', manager: true, employee: true },
        { id: 'reservations', name: 'Rezervasyon', manager: true, employee: true },
        { id: 'cost-settings', name: 'Maliyet Ayarları', manager: true, employee: false },
        { id: 'inventory', name: 'Envanter', manager: true, employee: true },
        { id: 'asim-listesi', name: 'Asım Listesi', manager: true, employee: true },
        { id: 'proposals', name: 'Teklifler', manager: true, employee: true },
        { id: 'contracts', name: 'Sözleşmeler', manager: true, employee: false },
        { id: 'incoming-calls', name: 'Arayan Firmalar', manager: true, employee: true },
        { id: 'settings', name: 'Ayarlar', manager: true, employee: false },
    ])

    // Login Logs (Mock Data)
    const [loginLogs] = useState([
        { id: 1, user: 'Ali Çınar', email: 'ali@izmiracikhavareklam.com', date: '2026-01-24 21:45', ip: '192.168.1.10', device: 'Windows - Chrome' },
        { id: 2, user: 'Ayşe Yılmaz', email: 'ayse@izmiracikhavareklam.com', date: '2026-01-24 20:12', ip: '192.168.1.15', device: 'iPhone - Safari' },
        { id: 3, user: 'Admin User', email: 'admin@cinar.com', date: '2026-01-24 19:30', ip: '176.234.12.88', device: 'Windows - Edge' },
        { id: 4, user: 'Can Bey', email: 'can@izmiracikhavareklam.com', date: '2026-01-24 18:05', ip: '192.168.1.22', device: 'Android - Chrome' },
        { id: 5, user: 'Simge Hanım', email: 'simge@izmiracikhavareklam.com', date: '2026-01-23 23:50', ip: '192.168.1.10', device: 'Windows - Chrome' },
    ])
    useEffect(() => {
        if (activeSection === 'users') {
            loadUsers()
        }
    }, [activeSection])

    const loadUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await usersService.getAll()
            setUsers(data)
        } catch (err) {
            setError('Kullanıcılar yüklenirken hata oluştu')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name) {
            setError('Lütfen tüm zorunlu alanları doldurun')
            return
        }

        setLoading(true)
        setError(null)
        try {
            await usersService.create(newUser)
            await loadUsers()
            setShowUserModal(false)
            resetNewUser()
        } catch (err: any) {
            setError(err.message || 'Kullanıcı oluşturulurken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateUser = async () => {
        if (!editingUser) return

        setLoading(true)
        setError(null)
        try {
            await usersService.update(editingUser.id, {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                phone: editingUser.phone,
                status: editingUser.status,
                permissions: editingUser.permissions,
                email: editingUser.email,
                password: editingUser.password // Artık e-posta değil, girilen şifreyi gönderiyoruz
            })
            await loadUsers()
            setEditingUser(null)
        } catch (err: any) {
            setError(err.message || 'Kullanıcı güncellenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return

        setLoading(true)
        setError(null)
        try {
            await usersService.delete(id)
            await loadUsers()
        } catch (err: any) {
            setError(err.message || 'Kullanıcı silinirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const resetNewUser = () => {
        setNewUser({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'EMPLOYEE',
            phone: '',
            permissions: ['dashboard', 'sales', 'reservations', 'inventory', 'proposals', 'incoming-calls']
        })
        setUserModalTab('info')
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-700'
            case 'MANAGER': return 'bg-purple-100 text-purple-700'
            case 'EMPLOYEE': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Yönetici'
            case 'MANAGER': return 'Müdür'
            case 'EMPLOYEE': return 'Çalışan'
            default: return role
        }
    }

    const getStatusBadgeColor = (status: string) => {
        return status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }

    const getStatusLabel = (status: string) => {
        return status === 'ACTIVE' ? 'Aktif' : 'Pasif'
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const renderProfileSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <input
                            type="text"
                            value={profileData.role}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Fotoğrafı</h3>
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">AD</span>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                        Fotoğraf Değiştir
                    </button>
                </div>
            </div>
        </div>
    )

    const renderUsersSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Yetkili Kullanıcılar</h3>
                <button
                    onClick={() => {
                        resetNewUser()
                        setShowUserModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Yeni Yetkili Ekle
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Henüz yetkili kullanıcı bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">
                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    {user.phone && (
                                        <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                                    {getStatusLabel(user.status)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingUser({
                                                ...user,
                                                permissions: user.permissions || ['dashboard', 'sales', 'reservations', 'inventory', 'proposals', 'incoming-calls']
                                            })
                                            setUserModalTab('info')
                                        }}
                                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Yeni Yetkili Ekle</h3>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setUserModalTab('info')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${userModalTab === 'info' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Genel Bilgiler
                            </button>
                            <button
                                onClick={() => setUserModalTab('permissions')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${userModalTab === 'permissions' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Sayfa Yetkileri
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {userModalTab === 'info' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı / E-posta *</label>
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Örn: ali@cinar.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Giriş Şifresi *</label>
                                            <input
                                                type="text"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                                            <input
                                                type="text"
                                                value={newUser.first_name}
                                                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Ad"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                                            <input
                                                type="text"
                                                value={newUser.last_name}
                                                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Soyad"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <input
                                            type="tel"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="+90 555 123 45 67"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="EMPLOYEE">Çalışan</option>
                                            <option value="MANAGER">Müdür</option>
                                            <option value="ADMIN">Yönetici</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-500 mb-4">Bu kullanıcının erişebileceği sayfaları işaretleyin:</p>
                                    {[
                                        { id: 'dashboard', name: 'Genel Bakış' },
                                        { id: 'sales', name: 'Satış' },
                                        { id: 'reservations', name: 'Rezervasyon' },
                                        { id: 'cost-settings', name: 'Maliyet Ayarları' },
                                        { id: 'inventory', name: 'Envanter' },
                                        { id: 'asim-listesi', name: 'Asım Listesi' },
                                        { id: 'proposals', name: 'Teklifler' },
                                        { id: 'contracts', name: 'Sözleşmeler' },
                                        { id: 'incoming-calls', name: 'Arayan Firmalar' },
                                        { id: 'settings', name: 'Ayarlar' },
                                    ].map((page) => (
                                        <label key={page.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={newUser.permissions.includes(page.id)}
                                                onChange={(e) => {
                                                    const perms = e.target.checked
                                                        ? [...newUser.permissions, page.id]
                                                        : newUser.permissions.filter((p: string) => p !== page.id)
                                                    setNewUser({ ...newUser, permissions: perms })
                                                }}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                            <span className="text-sm font-medium text-gray-900">{page.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <UserPlus className="w-4 h-4" />
                                )}
                                Kullanıcıyı Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Yetkili Düzenle</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setUserModalTab('info')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${userModalTab === 'info' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Genel Bilgiler
                            </button>
                            <button
                                onClick={() => setUserModalTab('permissions')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${userModalTab === 'permissions' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Sayfa Yetkileri
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {userModalTab === 'info' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı / E-posta</label>
                                            <input
                                                type="email"
                                                value={editingUser.email}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Değiştirilmeyecekse boş bırakın)</label>
                                            <input
                                                type="text"
                                                value={editingUser.password || ''}
                                                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                                                placeholder="Şifreyi güncellemek için yazın"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                            <input
                                                type="text"
                                                value={editingUser.first_name}
                                                onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                            <input
                                                type="text"
                                                value={editingUser.last_name}
                                                onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <input
                                            type="tel"
                                            value={editingUser.phone || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="+90 555 123 45 67"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                        <select
                                            value={editingUser.status}
                                            onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="ACTIVE">Aktif</option>
                                            <option value="INACTIVE">Pasif</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="EMPLOYEE">Çalışan</option>
                                            <option value="MANAGER">Müdür</option>
                                            <option value="ADMIN">Yönetici</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-500 mb-4">Bu kullanıcının erişebileceği sayfaları düzenleyin:</p>
                                    {[
                                        { id: 'dashboard', name: 'Genel Bakış' },
                                        { id: 'sales', name: 'Satış' },
                                        { id: 'reservations', name: 'Rezervasyon' },
                                        { id: 'cost-settings', name: 'Maliyet Ayarları' },
                                        { id: 'inventory', name: 'Envanter' },
                                        { id: 'asim-listesi', name: 'Asım Listesi' },
                                        { id: 'proposals', name: 'Teklifler' },
                                        { id: 'contracts', name: 'Sözleşmeler' },
                                        { id: 'incoming-calls', name: 'Arayan Firmalar' },
                                        { id: 'settings', name: 'Ayarlar' },
                                    ].map((page) => (
                                        <label key={page.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={(editingUser.permissions || []).includes(page.id)}
                                                onChange={(e) => {
                                                    const perms = e.target.checked
                                                        ? [...(editingUser.permissions || []), page.id]
                                                        : (editingUser.permissions || []).filter((p: string) => p !== page.id)
                                                    setEditingUser({ ...editingUser, permissions: perms })
                                                }}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                            <span className="text-sm font-medium text-gray-900">{page.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Değişiklikleri Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderNotificationsSection = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Bildirim Tercihleri</h3>

            <div className="space-y-4">
                {[
                    { key: 'emailNotifications', label: 'E-posta Bildirimleri', desc: 'Önemli güncellemeleri e-posta ile al' },
                    { key: 'pushNotifications', label: 'Anlık Bildirimler', desc: 'Tarayıcı bildirimleri al' },
                    { key: 'reservationAlerts', label: 'Rezervasyon Uyarıları', desc: 'Yeni rezervasyon ve değişiklikler hakkında bildirim' },
                    { key: 'paymentAlerts', label: 'Ödeme Uyarıları', desc: 'Ödeme ve fatura bildirimleri' },
                    { key: 'weeklyReport', label: 'Haftalık Rapor', desc: 'Her pazartesi haftalık özet raporu' },
                    { key: 'monthlyReport', label: 'Aylık Rapor', desc: 'Her ayın başında aylık performans raporu' },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => setNotificationSettings({
                                ...notificationSettings,
                                [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${notificationSettings[item.key as keyof typeof notificationSettings]
                                ? 'bg-primary-600'
                                : 'bg-gray-300'
                                }`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationSettings[item.key as keyof typeof notificationSettings]
                                ? 'translate-x-7'
                                : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderSecuritySection = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Güvenlik Ayarları</h3>

            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">Şifre Değiştir</p>
                        <button className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                            Değiştir
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">Son değişiklik: 30 gün önce</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-medium text-gray-900">Giriş Onay Sistemi</p>
                            <p className="text-sm text-gray-500">Kullanıcılar şifrelerini girseler bile yönetici onayı olmadan giriş yapamazlar</p>
                        </div>
                        <button
                            onClick={() => setSecuritySettings({ ...securitySettings, loginApproval: !securitySettings.loginApproval })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${securitySettings.loginApproval ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${securitySettings.loginApproval ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">İki Faktörlü Doğrulama</p>
                        <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                            Pasif
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">Hesabınızı daha güvenli hale getirmek için 2FA'yı etkinleştirin</p>
                    <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                        Etkinleştir
                    </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Aktif Oturumlar</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Windows - Chrome</span>
                            <span className="text-green-600 font-medium">Şu an aktif</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Görünüm Ayarları</h3>

            <div className="space-y-4">
                <div>
                    <p className="font-medium text-gray-900 mb-3">Tema</p>
                    <div className="flex gap-3">
                        {[
                            { value: 'light', label: 'Açık', color: 'bg-white border-2 border-gray-300' },
                            { value: 'dark', label: 'Koyu', color: 'bg-gray-900' },
                            { value: 'system', label: 'Sistem', color: 'bg-gradient-to-r from-white to-gray-900' },
                        ].map((theme) => (
                            <button
                                key={theme.value}
                                onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${appearanceSettings.theme === theme.value
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-12 h-8 rounded ${theme.color}`} />
                                <span className="text-sm font-medium">{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">Kompakt Mod</p>
                        <p className="text-sm text-gray-500">Daha fazla içerik görüntülemek için arayüzü sıkıştır</p>
                    </div>
                    <button
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, compactMode: !appearanceSettings.compactMode })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${appearanceSettings.compactMode ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                    >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${appearanceSettings.compactMode ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">Animasyonlar</p>
                        <p className="text-sm text-gray-500">Arayüz animasyonlarını göster</p>
                    </div>
                    <button
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, showAnimations: !appearanceSettings.showAnimations })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${appearanceSettings.showAnimations ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                    >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${appearanceSettings.showAnimations ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                    </button>
                </div>
            </div>
        </div>
    )

    const renderDataSection = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Veri Yönetimi</h3>

            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Verileri Dışa Aktar</p>
                    <p className="text-sm text-gray-500 mb-3">Tüm verilerinizi Excel formatında indirin</p>
                    <button className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                        Dışa Aktar
                    </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Önbelleği Temizle</p>
                    <p className="text-sm text-gray-500 mb-3">Tarayıcı önbelleğini ve yerel verileri temizle</p>
                    <button className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        Temizle
                    </button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-900 mb-2">Hesabı Sil</p>
                    <p className="text-sm text-red-600 mb-3">Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.</p>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        Hesabı Sil
                    </button>
                </div>
            </div>
        </div>
    )

    const renderPermissionsSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sayfa Yetkileri</h3>
                    <p className="text-sm text-gray-500 mt-1">Hangi rollerin hangi sayfalara erişebileceğini belirleyin.</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Modül / Sayfa</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center w-32">Yönetici</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center w-32">Çalışan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pagePermissions.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                        <span className="text-xs text-gray-500">/{item.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => {
                                                const newPerms = [...pagePermissions]
                                                newPerms[index].manager = !newPerms[index].manager
                                                setPagePermissions(newPerms)
                                            }}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${item.manager ? 'bg-primary-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${item.manager ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => {
                                                const newPerms = [...pagePermissions]
                                                newPerms[index].employee = !newPerms[index].employee
                                                setPagePermissions(newPerms)
                                            }}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${item.employee ? 'bg-primary-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${item.employee ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all shadow-sm"
                >
                    <Save className="w-4 h-4" />
                    Yetkilendirmeleri Kaydet
                </button>
            </div>
        </div>
    )

    const renderLanguageSection = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Dil & Bölge Ayarları</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dil</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zaman Dilimi</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="europe/istanbul">Türkiye (GMT+3)</option>
                        <option value="europe/london">Londra (GMT+0)</option>
                        <option value="america/new_york">New York (GMT-5)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Formatı</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="dd/mm/yyyy">GG/AA/YYYY</option>
                        <option value="mm/dd/yyyy">AA/GG/YYYY</option>
                        <option value="yyyy-mm-dd">YYYY-AA-GG</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="try">Türk Lirası (₺)</option>
                        <option value="usd">Amerikan Doları ($)</option>
                        <option value="eur">Euro (€)</option>
                    </select>
                </div>
            </div>
        </div>
    )

    const renderLoginLogsSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Giriş Kayıtları</h3>
                <p className="text-sm text-gray-500 mt-1">Sisteme yapılan son giriş denemelerini ve aktif oturumları izleyin.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Kullanıcı</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Tarih / Saat</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">IP Adresi</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Cihaz / Tarayıcı</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loginLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{log.user}</span>
                                            <span className="text-xs text-gray-500">{log.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {log.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                            {log.ip}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {log.device}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-center">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Daha Fazla Kayıt Yükle
                </button>
            </div>
        </div>
    )

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'profile': return renderProfileSection()
            case 'users': return renderUsersSection()
            case 'notifications': return renderNotificationsSection()
            case 'security': return renderSecuritySection()
            case 'permissions': return renderPermissionsSection()
            case 'login-logs': return renderLoginLogsSection()
            case 'appearance': return renderAppearanceSection()
            case 'data': return renderDataSection()
            case 'language': return renderLanguageSection()
            default: return renderProfileSection()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
                <p className="text-gray-500 mt-1">Hesap ve uygulama ayarlarını yönetin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const isActive = activeSection === section.id
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <section.icon className="w-5 h-5" />
                                        {section.name}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {renderActiveSection()}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
                            {saved && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <Check className="w-5 h-5" />
                                    <span className="text-sm font-medium">Kaydedildi!</span>
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
