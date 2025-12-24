import { useState, useEffect } from 'react'
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Building2,
    Phone,
    Mail,
    MapPin,
    FileText,
    User,
    Globe,
    X,
    Save,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Loader2
} from 'lucide-react'
import { clientsService } from '../services/clientsService'
import type { Client, CreateClientDto } from '../services/clientsService'

// Client Form Modal Component
interface ClientFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (client: CreateClientDto) => Promise<void>
    initialData?: Client
    loading?: boolean
}

function ClientFormModal({ isOpen, onClose, onSave, initialData, loading }: ClientFormModalProps) {
    const [formData, setFormData] = useState<CreateClientDto>({
        company_name: '',
        trade_name: '',
        tax_office: '',
        tax_number: '',
        sector: '',
        address: '',
        city: '',
        district: '',
        postal_code: '',
        country: 'Türkiye',
        phone: '',
        fax: '',
        email: '',
        website: '',
        contact_person: '',
        contact_title: '',
        contact_phone: '',
        contact_email: '',
        notes: '',
        status: 'potential'
    })

    const [activeTab, setActiveTab] = useState<'company' | 'address' | 'contact' | 'notes'>('company')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                company_name: initialData.company_name || '',
                trade_name: initialData.trade_name || '',
                tax_office: initialData.tax_office || '',
                tax_number: initialData.tax_number || '',
                sector: initialData.sector || '',
                address: initialData.address || '',
                city: initialData.city || '',
                district: initialData.district || '',
                postal_code: initialData.postal_code || '',
                country: initialData.country || 'Türkiye',
                phone: initialData.phone || '',
                fax: initialData.fax || '',
                email: initialData.email || '',
                website: initialData.website || '',
                contact_person: initialData.contact_person || '',
                contact_title: initialData.contact_title || '',
                contact_phone: initialData.contact_phone || '',
                contact_email: initialData.contact_email || '',
                notes: initialData.notes || '',
                status: initialData.status || 'potential'
            })
        } else {
            setFormData({
                company_name: '',
                trade_name: '',
                tax_office: '',
                tax_number: '',
                sector: '',
                address: '',
                city: '',
                district: '',
                postal_code: '',
                country: 'Türkiye',
                phone: '',
                fax: '',
                email: '',
                website: '',
                contact_person: '',
                contact_title: '',
                contact_phone: '',
                contact_email: '',
                notes: '',
                status: 'potential'
            })
        }
        setActiveTab('company')
    }, [initialData, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Failed to save client:', error)
            alert('Kaydetme başarısız oldu.')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-600 to-secondary-600">
                    <h2 className="text-xl font-semibold text-white">
                        {initialData ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {[
                        { id: 'company', label: 'Şirket Bilgileri', icon: Building2 },
                        { id: 'address', label: 'Adres', icon: MapPin },
                        { id: 'contact', label: 'İletişim', icon: Phone },
                        { id: 'notes', label: 'Notlar', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Company Info Tab */}
                        {activeTab === 'company' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Şirket Unvanı <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        placeholder="Örn: ABC Holding A.Ş."
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ticari Unvan
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Örn: ABC Grup"
                                        value={formData.trade_name || ''}
                                        onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sektör
                                    </label>
                                    <select
                                        className="input"
                                        value={formData.sector || ''}
                                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Perakende">Perakende</option>
                                        <option value="Teknoloji">Teknoloji</option>
                                        <option value="Otomotiv">Otomotiv</option>
                                        <option value="Gıda">Gıda</option>
                                        <option value="Tekstil">Tekstil</option>
                                        <option value="İnşaat">İnşaat</option>
                                        <option value="Sağlık">Sağlık</option>
                                        <option value="Finans">Finans</option>
                                        <option value="Eğitim">Eğitim</option>
                                        <option value="Turizm">Turizm</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vergi Dairesi
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Örn: Kordon"
                                        value={formData.tax_office || ''}
                                        onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vergi Numarası
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="10 haneli vergi numarası"
                                        maxLength={11}
                                        value={formData.tax_number || ''}
                                        onChange={(e) => setFormData({ ...formData, tax_number: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Durum
                                    </label>
                                    <select
                                        className="input"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Pasif</option>
                                        <option value="potential">Potansiyel</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Address Tab */}
                        {activeTab === 'address' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adres
                                    </label>
                                    <textarea
                                        className="input min-h-[80px]"
                                        placeholder="Mahalle, cadde/sokak, bina no, kat/daire"
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        İl
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Örn: İzmir"
                                        value={formData.city || ''}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        İlçe
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Örn: Konak"
                                        value={formData.district || ''}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Posta Kodu
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Örn: 35220"
                                        maxLength={5}
                                        value={formData.postal_code || ''}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ülke
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Örn: Türkiye"
                                        value={formData.country || ''}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Contact Tab */}
                        {activeTab === 'contact' && (
                            <div className="space-y-6">
                                {/* Company Contact */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Şirket İletişim Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Telefon
                                            </label>
                                            <input
                                                type="tel"
                                                className="input"
                                                placeholder="+90 2XX XXX XX XX"
                                                value={formData.phone || ''}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Faks
                                            </label>
                                            <input
                                                type="tel"
                                                className="input"
                                                placeholder="+90 2XX XXX XX XX"
                                                value={formData.fax || ''}
                                                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                E-posta
                                            </label>
                                            <input
                                                type="email"
                                                className="input"
                                                placeholder="info@sirket.com.tr"
                                                value={formData.email || ''}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Web Sitesi
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="www.sirket.com.tr"
                                                value={formData.website || ''}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Person */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Yetkili Kişi Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ad Soyad
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Yetkili kişinin adı soyadı"
                                                value={formData.contact_person || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ünvan
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Örn: Pazarlama Müdürü"
                                                value={formData.contact_title || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cep Telefonu
                                            </label>
                                            <input
                                                type="tel"
                                                className="input"
                                                placeholder="+90 5XX XXX XX XX"
                                                value={formData.contact_phone || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                E-posta
                                            </label>
                                            <input
                                                type="email"
                                                className="input"
                                                placeholder="yetkili@sirket.com.tr"
                                                value={formData.contact_email || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes Tab */}
                        {activeTab === 'notes' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notlar
                                </label>
                                <textarea
                                    className="input min-h-[200px]"
                                    placeholder="Müşteri hakkında önemli notlar, özel istekler, dikkat edilecek hususlar..."
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={saving}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex items-center gap-2"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Client Card Component
interface ClientCardProps {
    client: Client
    onEdit: (client: Client) => void
    onDelete: (id: string) => void
    expanded: boolean
    onToggle: () => void
}

function ClientCard({ client, onEdit, onDelete, expanded, onToggle }: ClientCardProps) {
    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        potential: 'bg-yellow-100 text-yellow-800'
    }

    const statusLabels = {
        active: 'Aktif',
        inactive: 'Pasif',
        potential: 'Potansiyel'
    }

    const displayName = client.company_name || client.name || 'Bilinmeyen Şirket'

    return (
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
            {/* Card Header */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-white">
                                {displayName.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {displayName}
                            </h3>
                            {client.trade_name && (
                                <p className="text-sm text-gray-500">{client.trade_name}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status] || statusColors.potential}`}>
                                    {statusLabels[client.status] || 'Potansiyel'}
                                </span>
                                {client.sector && (
                                    <span className="text-xs text-gray-400">• {client.sector}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(client)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(client.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onToggle}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Projeler</p>
                            <p className="text-sm font-semibold text-gray-900">{client.total_projects || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Toplam Ciro</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {(client.total_revenue || 0).toLocaleString('tr-TR')} ₺
                            </p>
                        </div>
                    </div>
                    {client.contact_person && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Yetkili</p>
                                <p className="text-sm font-semibold text-gray-900">{client.contact_person}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="p-5 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Company Info */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary-600" />
                                Şirket Bilgileri
                            </h4>
                            <div className="space-y-2 text-sm">
                                {client.tax_office && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vergi Dairesi:</span>
                                        <span className="font-medium text-gray-900">{client.tax_office}</span>
                                    </div>
                                )}
                                {client.tax_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vergi No:</span>
                                        <span className="font-medium text-gray-900">{client.tax_number}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Kayıt Tarihi:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(client.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                Adres
                            </h4>
                            <div className="text-sm text-gray-600">
                                {client.address && <p>{client.address}</p>}
                                <p>
                                    {[client.district, client.city, client.postal_code].filter(Boolean).join(', ')}
                                </p>
                                {client.country && <p>{client.country}</p>}
                                {!client.address && !client.city && <p className="text-gray-400 italic">Adres bilgisi yok</p>}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary-600" />
                                İletişim
                            </h4>
                            <div className="space-y-2 text-sm">
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-3 h-3" />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-3 h-3" />
                                        <span>{client.email}</span>
                                    </div>
                                )}
                                {client.website && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Globe className="w-3 h-3" />
                                        <span>{client.website}</span>
                                    </div>
                                )}
                                {!client.phone && !client.email && <p className="text-gray-400 italic">İletişim bilgisi yok</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Person & Notes */}
                    {(client.contact_person || client.notes) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.contact_person && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary-600" />
                                        Yetkili Kişi
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium text-gray-900">{client.contact_person}</p>
                                        {client.contact_title && (
                                            <p className="text-gray-500">{client.contact_title}</p>
                                        )}
                                        {client.contact_phone && (
                                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                                                <Phone className="w-3 h-3" />
                                                <span>{client.contact_phone}</span>
                                            </div>
                                        )}
                                        {client.contact_email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-3 h-3" />
                                                <span>{client.contact_email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {client.notes && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary-600" />
                                        Notlar
                                    </h4>
                                    <p className="text-sm text-gray-600">{client.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Main Page Component
export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Fetch clients on mount
    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const data = await clientsService.getAll()
            setClients(data)
        } catch (error) {
            console.error('Failed to fetch clients:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter clients
    const filteredClients = clients.filter(client => {
        const displayName = client.company_name || client.name || ''
        const matchesSearch =
            displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.trade_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.tax_number || '').includes(searchTerm)

        const matchesStatus = filterStatus === 'all' || client.status === filterStatus

        return matchesSearch && matchesStatus
    })

    // Stats
    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        potential: clients.filter(c => c.status === 'potential').length,
        totalRevenue: clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0)
    }

    const handleAddNew = () => {
        setEditingClient(undefined)
        setIsFormOpen(true)
    }

    const handleEdit = (client: Client) => {
        setEditingClient(client)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
            try {
                await clientsService.delete(id)
                setClients(clients.filter(c => c.id !== id))
            } catch (error) {
                console.error('Failed to delete client:', error)
                alert('Silme işlemi başarısız oldu.')
            }
        }
    }

    const handleSave = async (clientData: CreateClientDto) => {
        if (editingClient) {
            // Update existing
            const updated = await clientsService.update(editingClient.id, clientData)
            setClients(clients.map(c => c.id === editingClient.id ? updated : c))
        } else {
            // Add new
            const created = await clientsService.create(clientData)
            setClients([created, ...clients])
        }
        setIsFormOpen(false)
    }

    const [viewMode, setViewMode] = useState<'card' | 'table'>('table')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Satış ve Müşteri</h1>
                    <p className="text-gray-600 mt-1">Müşteri portföyünüzü yönetin ve satış fırsatlarını takip edin</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Liste Görünümü"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Kart Görünümü"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Müşteri Ekle
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Toplam Müşteri</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Aktif Müşteri</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Potansiyel</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.potential}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Toplam Ciro</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalRevenue.toLocaleString('tr-TR')} ₺
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Şirket adı, yetkili kişi veya vergi numarası ara..."
                            className="input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => setFilterStatus('potential')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'potential'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                        >
                            Potansiyel
                        </button>
                        <button
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'inactive'
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pasif
                        </button>
                    </div>
                </div>
            </div>

            {/* Client List */}
            {loading ? (
                <div className="card p-12 text-center">
                    <Loader2 className="w-12 h-12 mx-auto text-primary-600 animate-spin mb-4" />
                    <p className="text-gray-500">Müşteriler yükleniyor...</p>
                </div>
            ) : (
                <>
                    {filteredClients.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Müşteri Bulunamadı</h3>
                            <p className="text-gray-500 mb-4">
                                {clients.length === 0
                                    ? 'Henüz müşteri eklenmemiş. İlk müşterinizi ekleyin!'
                                    : 'Arama kriterlerinize uygun müşteri yok.'}
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="btn btn-primary inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Yeni Müşteri Ekle
                            </button>
                        </div>
                    ) : (
                        viewMode === 'table' ? (
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="text-xs text-white uppercase bg-gradient-to-r from-primary-600 to-secondary-600 border-b border-primary-700">
                                            <tr>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold">Şirket Ünvanı</th>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold">Ticari Unvan</th>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold">Yetkili Kişi</th>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold">İletişim</th>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold">Sektör / Vergi No</th>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold">Durum</th>
                                                <th className="px-4 py-3 border-r border-primary-500/30 font-semibold text-right">Ciro</th>
                                                <th className="px-4 py-3 font-semibold text-center w-24">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredClients.map((client) => (
                                                <tr key={client.id} className="hover:bg-gray-50 group">
                                                    <td className="px-4 py-3 border-r font-medium text-gray-900">
                                                        {client.company_name}
                                                    </td>
                                                    <td className="px-4 py-3 border-r text-gray-600">
                                                        {client.trade_name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 border-r">
                                                        {client.contact_person ? (
                                                            <div>
                                                                <div className="font-medium text-gray-900">{client.contact_person}</div>
                                                                {client.contact_title && (
                                                                    <div className="text-xs text-gray-500">{client.contact_title}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 border-r">
                                                        <div className="flex flex-col gap-1">
                                                            {client.phone && (
                                                                <div className="flex items-center gap-1.5 text-xs">
                                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                                    <span>{client.phone}</span>
                                                                </div>
                                                            )}
                                                            {client.email && (
                                                                <div className="flex items-center gap-1.5 text-xs">
                                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                                    <a href={`mailto:${client.email}`} className="hover:text-primary-600">{client.email}</a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r">
                                                        <div className="space-y-1">
                                                            {client.sector && (
                                                                <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                                                    {client.sector}
                                                                </div>
                                                            )}
                                                            {client.tax_number && (
                                                                <div className="text-xs text-gray-500 font-mono">
                                                                    VN: {client.tax_number}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-r">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                            ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                            {client.status === 'active' ? 'Aktif' :
                                                                client.status === 'inactive' ? 'Pasif' : 'Potansiyel'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-r text-right font-medium text-gray-900">
                                                        {(client.total_revenue || 0).toLocaleString('tr-TR')} ₺
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEdit(client)}
                                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                                                title="Düzenle"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(client.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Sil"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500 flex justify-between">
                                    <div>Toplam {filteredClients.length} kayıt listelendi</div>
                                    <div>
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Aktif
                                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mx-1 ml-3"></span> Potansiyel
                                        <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mx-1 ml-3"></span> Pasif
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredClients.map((client) => (
                                    <ClientCard
                                        key={client.id}
                                        client={client}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        expanded={expandedId === client.id}
                                        onToggle={() => setExpandedId(expandedId === client.id ? null : client.id)}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </>
            )}

            {/* Form Modal */}
            <ClientFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                initialData={editingClient}
            />
        </div>
    )
}
