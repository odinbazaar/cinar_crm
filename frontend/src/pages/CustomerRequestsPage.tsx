import { useState, useEffect } from 'react'
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    FileText,
    Calendar,
    Building2,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Filter,
    X,
    Save,
    User,
    Hash,
    DollarSign,
    ChevronDown,
    Bell,
    StickyNote,
    List
} from 'lucide-react'
import { customerRequestsService } from '../services/customerRequestsService'
import type { CustomerRequest, CreateCustomerRequestDto, UpdateCustomerRequestDto } from '../services/customerRequestsService'
import { clientsService } from '../services/clientsService'
import type { Client } from '../services/clientsService'
import { expenseCategories } from '../services/budgetService'

// Product type labels in Turkish
const productTypeLabels: Record<string, string> = {
    billboard: 'Billboard',
    megalight: 'Megalight',
    digital_screen: 'Dijital Ekran',
    bus_shelter: 'Otobüs Durağı',
    bridge_banner: 'Köprü Pankartı',
    raket: 'Raket',
    giant_board: 'Giant Board',
    other: 'Diğer'
}

// Status labels in Turkish
const statusLabels: Record<string, string> = {
    pending: 'Beklemede',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    in_progress: 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi'
}

// Priority labels in Turkish
const priorityLabels: Record<string, string> = {
    low: 'Düşük',
    medium: 'Normal',
    high: 'Yüksek',
    urgent: 'Acil'
}

// Status colors
const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

// Priority colors
const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
}

// Request Form Modal Component
interface RequestFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: CreateCustomerRequestDto | UpdateCustomerRequestDto) => Promise<void>
    initialData?: CustomerRequest
    clients: Client[]
    loading?: boolean
}

function RequestFormModal({ isOpen, onClose, onSave, initialData, clients, loading }: RequestFormModalProps) {
    const [formData, setFormData] = useState<CreateCustomerRequestDto>({
        client_id: '',
        product_type: 'billboard',
        product_details: '',
        quantity: 1,
        preferred_districts: [],
        start_date: '',
        end_date: '',
        budget_min: undefined,
        budget_max: undefined,
        priority: 'medium',
        notes: ''
    })

    const [noteInput, setNoteInput] = useState({
        content: '',
        date: new Date().toISOString().split('T')[0],
        reminderDate: '',
        reminderTime: '10:00',
        repeat: false
    })
    const [noteFilterDate, setNoteFilterDate] = useState('')

    const [taxSearch, setTaxSearch] = useState('')

    useEffect(() => {
        if (initialData) {
            setFormData({
                client_id: initialData.client_id,
                product_type: initialData.product_type,
                product_details: initialData.product_details || '',
                quantity: initialData.quantity,
                preferred_districts: initialData.preferred_districts || [],
                start_date: initialData.start_date?.split('T')[0] || '',
                end_date: initialData.end_date?.split('T')[0] || '',
                budget_min: initialData.budget_min,
                budget_max: initialData.budget_max,
                priority: initialData.priority,
                notes: initialData.notes || ''
            })
            // Set initial tax search if client has one
            const client = clients.find(c => c.id === initialData.client_id)
            if (client?.tax_number) {
                setTaxSearch(client.tax_number)
            }
        } else {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            setFormData({
                client_id: '',
                product_type: 'billboard',
                product_details: '',
                quantity: 1,
                preferred_districts: [],
                start_date: today.toISOString().split('T')[0],
                end_date: tomorrow.toISOString().split('T')[0],
                budget_min: undefined,
                budget_max: undefined,
                priority: 'medium',
                notes: ''
            })
            setTaxSearch('')
        }
    }, [initialData, isOpen, clients])

    const handleTaxSearch = (vkn: string) => {
        setTaxSearch(vkn)
        if (vkn.trim()) {
            const foundClient = clients.find(c => c.tax_number === vkn.trim())
            if (foundClient) {
                setFormData(prev => ({ ...prev, client_id: foundClient.id }))
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave(formData)
    }

    if (!isOpen) return null

    const selectedClient = clients.find(c => c.id === formData.client_id)

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {initialData ? 'Talebi Düzenle' : 'Yeni Müşteri Talebi'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-5">
                            {/* Tax Search */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Hash className="w-4 h-4 inline mr-2" />
                                    Vergi Numarası ile Ara
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={taxSearch}
                                        onChange={(e) => handleTaxSearch(e.target.value)}
                                        placeholder="Vergi numarasını girin..."
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                    {taxSearch && !clients.some(c => c.tax_number === taxSearch) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <AlertCircle className="w-5 h-5 text-orange-400" />
                                        </div>
                                    )}
                                    {taxSearch && clients.some(c => c.tax_number === taxSearch) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Building2 className="w-4 h-4 inline mr-2" />
                                    Müşteri *
                                </label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Müşteri Seçin...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.company_name} {client.city ? `- ${client.city}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Client Info Card */}
                            {selectedClient && (
                                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                                    <h4 className="text-sm font-medium text-slate-400 mb-3">Müşteri Bilgileri</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Building2 className="w-4 h-4 text-violet-400" />
                                            <span>{selectedClient.company_name}</span>
                                        </div>
                                        {selectedClient.contact_person && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <User className="w-4 h-4 text-violet-400" />
                                                <span>{selectedClient.contact_person}</span>
                                            </div>
                                        )}
                                        {selectedClient.phone && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Phone className="w-4 h-4 text-violet-400" />
                                                <span>{selectedClient.phone}</span>
                                            </div>
                                        )}
                                        {selectedClient.email && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Mail className="w-4 h-4 text-violet-400" />
                                                <span>{selectedClient.email}</span>
                                            </div>
                                        )}
                                        {selectedClient.city && (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <MapPin className="w-4 h-4 text-violet-400" />
                                                <span>{selectedClient.city}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Product Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Ürün Tipi *
                                </label>
                                <select
                                    value={formData.product_type}
                                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                >
                                    {Object.entries(productTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Product Details */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Ürün Detayları
                                </label>
                                <textarea
                                    value={formData.product_details}
                                    onChange={(e) => setFormData({ ...formData, product_details: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                                    rows={3}
                                    placeholder="Boyut, konum tercihi vb."
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Hash className="w-4 h-4 inline mr-2" />
                                    Adet
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                            </div>


                        </div>

                        {/* Right Column */}
                        <div className="space-y-5">

                            {/* Notlar Bölümü */}
                            <div className="bg-slate-700/30 p-5 rounded-2xl border border-slate-600/50 space-y-4">
                                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm mb-2">
                                    <StickyNote className="w-4 h-4" />
                                    <h3>Notlar ve Hatırlatıcılar</h3>
                                </div>

                                {/* Yeni Not Girişi */}
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 space-y-3">
                                    <textarea
                                        value={noteInput.content}
                                        onChange={(e) => setNoteInput({ ...noteInput, content: e.target.value })}
                                        placeholder="Hatırlatma veya not yazın..."
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500 min-h-[80px]"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Hatırlatma Tarihi</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="date"
                                                    value={noteInput.reminderDate}
                                                    onChange={(e) => setNoteInput({ ...noteInput, reminderDate: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-violet-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Saat</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="time"
                                                    value={noteInput.reminderTime}
                                                    onChange={(e) => setNoteInput({ ...noteInput, reminderTime: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-violet-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={noteInput.repeat}
                                                    onChange={(e) => setNoteInput({ ...noteInput, repeat: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-8 h-4 rounded-full transition-colors ${noteInput.repeat ? 'bg-violet-600' : 'bg-slate-700'}`}></div>
                                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${noteInput.repeat ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-xs text-slate-400 group-hover:text-slate-300">Tekrarlı Uyarı</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!noteInput.content) return;
                                                const newNote = {
                                                    id: Date.now().toString(),
                                                    content: noteInput.content,
                                                    date: noteInput.date,
                                                    reminderDate: noteInput.reminderDate,
                                                    reminderTime: noteInput.reminderTime,
                                                    repeat: noteInput.repeat,
                                                    isReminded: false,
                                                    createdAt: new Date().toISOString()
                                                };
                                                const currentNotes = formData.notes ? (formData.notes.startsWith('[') ? JSON.parse(formData.notes) : []) : [];
                                                const updatedNotes = JSON.stringify([...currentNotes, newNote]);
                                                setFormData({ ...formData, notes: updatedNotes });
                                                setNoteInput({ ...noteInput, content: '', reminderDate: '', repeat: false });
                                            }
                                            }
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Notu Ekle
                                        </button>
                                    </div>
                                </div>

                                {/* Kayıtlı Notlar */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
                                            <List className="w-3.5 h-3.5 text-slate-500" />
                                            Kayıtlı Notlar
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={noteFilterDate}
                                                onChange={(e) => setNoteFilterDate(e.target.value)}
                                                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300"
                                            />
                                            {noteFilterDate && (
                                                <button onClick={() => setNoteFilterDate('')} className="text-[10px] text-violet-400 hover:underline">Temizle</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {(() => {
                                            const notesStr = formData.notes || '[]';
                                            let notesArr = [];
                                            try {
                                                notesArr = notesStr.startsWith('[') ? JSON.parse(notesStr) : (notesStr ? [{ id: 'old', content: notesStr, date: 'Legacy' }] : []);
                                            } catch (e) {
                                                notesArr = [];
                                            }

                                            const filtered = noteFilterDate ? notesArr.filter((n: any) => n.date === noteFilterDate) : notesArr;

                                            if (filtered.length === 0) {
                                                return <div className="text-center py-6 text-slate-500 text-xs italic">Not bulunamadı.</div>;
                                            }

                                            return [...filtered].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((note: any) => (
                                                <div key={note.id} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl group relative">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-500 text-[9px] font-bold rounded uppercase">
                                                            {note.date}
                                                        </span>
                                                        {note.reminderDate && (
                                                            <span className={`px-1.5 py-0.5 ${note.isReminded ? 'bg-slate-900 text-slate-600' : 'bg-red-500/10 text-red-400'} text-[9px] font-bold rounded flex items-center gap-1`}>
                                                                <Bell className="w-2.5 h-2.5" />
                                                                {note.reminderDate} {note.reminderTime}
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = JSON.stringify(notesArr.filter((n: any) => n.id !== note.id));
                                                                setFormData({ ...formData, notes: updated });
                                                            }}
                                                            className="absolute right-2 top-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Budget Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-2" />
                                    Bütçe Kaynağı
                                </label>
                                <select
                                    value={(formData as any).budget_category || ''}
                                    onChange={(e) => setFormData({ ...formData, budget_category: e.target.value } as any)}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Bütçe Seçin...</option>
                                    {expenseCategories.map(category => (
                                        <option key={category.id} value={category.name}>
                                            {category.name} (Kalan: ₺{category.value.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {initialData ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Request Card Component
interface RequestCardProps {
    request: CustomerRequest
    onEdit: (request: CustomerRequest) => void
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: string) => void
}

function RequestCard({ request, onEdit, onDelete, onStatusChange }: RequestCardProps) {
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-violet-500/30 transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">{request.request_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}>
                            {priorityLabels[request.priority]}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Building2 className="w-4 h-4" />
                        <span>{request.client?.company_name || 'Bilinmeyen Müşteri'}</span>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1 ${statusColors[request.status]}`}
                    >
                        {statusLabels[request.status]}
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    {showStatusMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        onStatusChange(request.id, value)
                                        setShowStatusMenu(false)
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-600 transition-colors ${request.status === value ? 'text-violet-400' : 'text-slate-300'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="bg-slate-700/30 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <div className="text-white font-medium">{productTypeLabels[request.product_type]}</div>
                        <div className="text-slate-400 text-sm">{request.quantity} adet</div>
                    </div>
                </div>
                {request.product_details && (
                    <p className="text-slate-400 text-sm mt-2">{request.product_details}</p>
                )}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-slate-300 mb-3">
                <Calendar className="w-4 h-4 text-violet-400" />
                <span className="text-sm">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                </span>
            </div>

            {/* Budget */}
            {(request.budget_min || request.budget_max) && (
                <div className="flex items-center gap-2 text-slate-300 mb-3">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm">
                        Bütçe: {request.budget_min ? formatCurrency(request.budget_min) : '?'} - {request.budget_max ? formatCurrency(request.budget_max) : '?'}
                    </span>
                </div>
            )}

            {/* Contact Info */}
            {request.client && (
                <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-4">
                    {request.client.contact_person && (
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {request.client.contact_person}
                        </div>
                    )}
                    {request.client.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {request.client.phone}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">
                    {formatDate(request.created_at)}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(request)}
                        className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(request.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Main Page Component
export default function CustomerRequestsPage() {
    const [requests, setRequests] = useState<CustomerRequest[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [productFilter, setProductFilter] = useState<string>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRequest, setEditingRequest] = useState<CustomerRequest | undefined>(undefined)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [requestsData, clientsData] = await Promise.all([
                customerRequestsService.getAll(),
                clientsService.getAll()
            ])
            setRequests(requestsData)
            setClients(clientsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setEditingRequest(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (request: CustomerRequest) => {
        setEditingRequest(request)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu talebi silmek istediğinize emin misiniz?')) return

        try {
            await customerRequestsService.delete(id)
            setRequests(requests.filter(r => r.id !== id))
        } catch (error) {
            console.error('Error deleting request:', error)
        }
    }

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const updated = await customerRequestsService.update(id, { status: status as any })
            setRequests(requests.map(r => r.id === id ? updated : r))
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const handleSave = async (data: CreateCustomerRequestDto | UpdateCustomerRequestDto) => {
        try {
            setSaving(true)
            if (editingRequest) {
                const updated = await customerRequestsService.update(editingRequest.id, data)
                setRequests(requests.map(r => r.id === editingRequest.id ? updated : r))
            } else {
                const created = await customerRequestsService.create(data as CreateCustomerRequestDto)
                setRequests([created, ...requests])
            }
            setIsModalOpen(false)
            setEditingRequest(undefined)
        } catch (error) {
            console.error('Error saving request:', error)
        } finally {
            setSaving(false)
        }
    }

    // Filter requests
    const filteredRequests = requests.filter(request => {
        const matchesSearch =
            request.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.client?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            productTypeLabels[request.product_type]?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter
        const matchesProduct = productFilter === 'all' || request.product_type === productFilter

        return matchesSearch && matchesStatus && matchesProduct
    })

    // Stats
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Müşteri Talepleri</h1>
                        <p className="text-slate-400">Müşteri taleplerini yönetin ve takip edin</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Talep
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/20 rounded-lg">
                                <FileText className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.total}</div>
                                <div className="text-slate-400 text-sm">Toplam Talep</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.pending}</div>
                                <div className="text-slate-400 text-sm">Beklemede</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.approved}</div>
                                <div className="text-slate-400 text-sm">Onaylandı</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats.in_progress}</div>
                                <div className="text-slate-400 text-sm">İşlemde</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[280px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Talep numarası, müşteri veya ürün ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="all">Tüm Durumlar</option>
                        {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>

                    {/* Product Filter */}
                    <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="all">Tüm Ürünler</option>
                        {Object.entries(productTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-400 mb-2">Talep Bulunamadı</h3>
                    <p className="text-slate-500 mb-6">Henüz müşteri talebi oluşturulmamış veya filtrelerinize uygun talep yok.</p>
                    <button
                        onClick={handleAddNew}
                        className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl transition-all inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        İlk Talebi Oluştur
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredRequests.map(request => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <RequestFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingRequest(undefined)
                }}
                onSave={handleSave}
                initialData={editingRequest}
                clients={clients}
                loading={saving}
            />
        </div>
    )
}
