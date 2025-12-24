import { useState, useEffect } from 'react'
import {
    User,
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
    Users
} from 'lucide-react'
import { usersService } from '../services/usersService'
import type { CreateUserDto } from '../services/usersService'
import type { User as UserType } from '../services/authService'

interface SettingSection {
    id: string
    name: string
    icon: typeof User
}

const sections: SettingSection[] = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'users', name: 'Yetkili Yönetimi', icon: Users },
    { id: 'notifications', name: 'Bildirimler', icon: Bell },
    { id: 'security', name: 'Güvenlik', icon: Shield },
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
    const [editingUser, setEditingUser] = useState<UserType | null>(null)
    const [newUser, setNewUser] = useState<CreateUserDto>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'EMPLOYEE',
        phone: ''
    })

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

    // Appearance settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        compactMode: false,
        showAnimations: true
    })

    // Load users when section becomes active
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
                status: editingUser.status
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
            phone: ''
        })
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
                                        onClick={() => setEditingUser(user)}
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
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Yeni Yetkili Ekle</h3>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
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

                        <div className="flex justify-end gap-3 mt-6">
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
                                Ekle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Yetkili Düzenle</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <input
                                    type="tel"
                                    value={editingUser.phone || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
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
                                Kaydet
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

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'profile': return renderProfileSection()
            case 'users': return renderUsersSection()
            case 'notifications': return renderNotificationsSection()
            case 'security': return renderSecuritySection()
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
