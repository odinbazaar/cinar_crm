import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Phone,
    Mail,
    Search,
    Building2,
    UserPlus,
    X,
    Save,
    StickyNote,
    MapPin,
    Building,
    Loader2,
    CheckCircle,
    XCircle,
    MessageSquare,
    Plus,
    Edit2,
    Trash2,
    Globe
} from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { incomingCallsService, type IncomingCall } from '../services/incomingCallsService'
import { clientsService } from '../services/clientsService'

export default function IncomingCallsPage() {
    const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCall, setSelectedCall] = useState<IncomingCall | null>(null)
    const [showAddCallModal, setShowAddCallModal] = useState(false)
    const { success, error } = useToast()
    const navigate = useNavigate()

    const [newCallForm, setNewCallForm] = useState({
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        request_detail: '',
        notes: '',
        called_phone: ''
    })

    const [customerForm, setCustomerForm] = useState({
        companyName: '',
        tradeName: '',
        sector: '',
        taxOffice: '',
        taxNumber: '',
        status: 'Potansiyel',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        contactPerson: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        notes: '',
        requestDetail: '',
        calledPhone: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const calls = await incomingCallsService.getAll()
            setIncomingCalls(calls)
        } catch (e) {
            console.error('Error fetching incoming calls:', e)
            error('Arayan firmalar yüklenirken hata oluştu.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateIncomingCall = async () => {
        if (!newCallForm.company_name) {
            error('Firma adı zorunludur!')
            return
        }

        try {
            if (selectedCall && showAddCallModal) {
                await incomingCallsService.update(selectedCall.id, newCallForm);
                success('Kayıt güncellendi.');
            } else {
                await incomingCallsService.create({
                    ...newCallForm,
                    call_date: new Date().toISOString().split('T')[0],
                    status: 'pending'
                })
                success('Yeni arama kaydı oluşturuldu.')
            }

            closeAddCallModal()
            fetchData()
        } catch (e) {
            error('İşlem sırasında bir hata oluştu.')
        }
    }

    const closeAddCallModal = () => {
        setShowAddCallModal(false)
        setSelectedCall(null)
        setNewCallForm({
            company_name: '',
            contact_person: '',
            phone: '',
            email: '',
            request_detail: '',
            notes: '',
            called_phone: ''
        })
    }

    const handleDeleteCall = async (id: string) => {
        console.log('handleDeleteCall called for id:', id);
        if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

        try {
            await incomingCallsService.delete(id);
            success('Kayıt silindi.');
            fetchData();
        } catch (e) {
            console.error('Delete error:', e);
            error('Silme işlemi başarısız.');
        }
    }

    const handleEditCall = (call: IncomingCall) => {
        setSelectedCall(call);
        setNewCallForm({
            company_name: call.company_name || '',
            contact_person: call.contact_person || '',
            phone: call.phone || '',
            email: call.email || '',
            request_detail: call.request_detail || '',
            notes: call.notes || '',
            called_phone: call.called_phone || ''
        });
        setShowAddCallModal(true);
    }

    const handleOpenCustomerModal = (call: IncomingCall) => {
        // Navigasyon ile Satış sayfasına veriyi gönder
        const quotedCompanyName = call.company_name ? `"${call.company_name}"` : '';
        navigate('/sales', {
            state: {
                prefill: {
                    companyName: quotedCompanyName,
                    contactPerson: call.contact_person || '',
                    email: call.email || '',
                    phone: call.phone || '',
                    requestDetail: call.request_detail || '',
                    calledPhone: call.called_phone || '',
                    notes: call.notes || '',
                    incomingCallId: call.id
                }
            }
        })
    }

    const filteredCalls = incomingCalls.filter(call =>
        call.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phone?.includes(searchTerm)
    )

    const pendingCalls = filteredCalls.filter(c => c.status === 'pending')
    const contactedCalls = filteredCalls.filter(c => c.status === 'contacted')
    const convertedCalls = filteredCalls.filter(c => c.status === 'converted')

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Arayan Firmalar</h1>
                    <p className="text-gray-500">Excel'den aktarılan veya manüel girilen potansiyel müşteriler</p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-primary-600 font-medium bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Yükleniyor...</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Toplam</p>
                            <p className="text-2xl font-bold text-gray-900">{incomingCalls.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Bekleyen</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingCalls.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">İletişime Geçildi</p>
                            <p className="text-2xl font-bold text-blue-600">{contactedCalls.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Müşteri Oldu</p>
                            <p className="text-2xl font-bold text-green-600">{convertedCalls.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Firma, kişi veya telefon ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAddCallModal(true)}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Müşteri Ekle
                    </button>
                    <div className="text-sm text-gray-500">
                        {filteredCalls.length} / {incomingCalls.length} kayıt gösteriliyor
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCalls.map((call) => (
                    <div key={call.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-xl transition-all relative group border-t-4 border-t-primary-500">
                        {/* Status & Delete */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex flex-col gap-1">
                                <span className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${call.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    call.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                        call.status === 'converted' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {call.status === 'pending' ? 'Bekliyor' :
                                        call.status === 'contacted' ? 'İletişime Geçildi' :
                                            call.status === 'converted' ? 'Müşteri Oldu' : 'Reddedildi'}
                                </span>
                                {call.call_date && (
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(call.call_date).toLocaleDateString('tr-TR')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Title & Edit */}
                        <div className="mb-1">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">
                                {call.company_name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mb-4">{call.contact_person || 'Yetkili Belirtilmemiş'}</p>

                        {/* Info List */}
                        <div className="space-y-3 mb-5">
                            {call.phone && (
                                <div className="flex items-center gap-3 text-gray-700 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                        <Phone className="w-4 h-4 text-primary-500" />
                                    </div>
                                    <span className="font-semibold text-sm">{call.phone}</span>
                                </div>
                            )}

                            {/* "Aranan Hat" Kısmı */}
                            {call.called_phone && (
                                <div className="flex items-center gap-2 px-1 text-gray-600">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-medium">Aranan Hat: <span className="text-gray-900 font-bold">{call.called_phone}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Request Detail */}
                        {call.request_detail && (
                            <div className="bg-orange-50/60 rounded-xl p-4 mb-4 border border-orange-100/50">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-wider mb-1.5">Müşteri Talebi</p>
                                <p className="text-sm text-orange-950 leading-relaxed line-clamp-4">{call.request_detail}</p>
                            </div>
                        )}

                        {/* Ek Notlar Kısmı */}
                        {call.notes && (
                            <div className="mb-5 px-1 pb-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Notlar</p>
                                <p className="text-xs text-gray-600 italic leading-snug">{call.notes}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                            {call.status !== 'converted' ? (
                                <>
                                    <button
                                        onClick={() => handleEditCall(call)}
                                        className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCall(call.id)}
                                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Sil
                                    </button>
                                </>
                            ) : (
                                <div className="w-full px-4 py-3 text-sm font-bold text-green-700 bg-green-50 rounded-xl flex items-center justify-center gap-2 border border-green-100">
                                    <CheckCircle className="w-5 h-5" />
                                    Müşteri Olarak Kaydedildi
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Yeni Giriş / Düzenleme Modalı */}
            {
                showAddCallModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                        {selectedCall ? <Edit2 className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        {selectedCall ? 'Kaydı Düzenle' : 'Yeni Arayan Firma Girişi'}
                                    </h2>
                                </div>
                                <button onClick={closeAddCallModal} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Firma Adı *</label>
                                    <input
                                        type="text"
                                        value={newCallForm.company_name}
                                        onChange={(e) => setNewCallForm({ ...newCallForm, company_name: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="Örn: ABC Ltd. Şti."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">İletişim Kişisi</label>
                                        <input
                                            type="text"
                                            value={newCallForm.contact_person}
                                            onChange={(e) => setNewCallForm({ ...newCallForm, contact_person: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2"
                                            placeholder="İsim Soyisim"
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefon</label>
                                        <input
                                            type="tel"
                                            value={newCallForm.phone}
                                            onChange={(e) => setNewCallForm({ ...newCallForm, phone: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Aranan Şirket Hattı</label>
                                    <input
                                        type="text"
                                        value={newCallForm.called_phone}
                                        onChange={(e) => setNewCallForm({ ...newCallForm, called_phone: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2"
                                        placeholder="Örn: Çınar Sabit 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Müşteri Talebi</label>
                                    <textarea
                                        value={newCallForm.request_detail}
                                        onChange={(e) => setNewCallForm({ ...newCallForm, request_detail: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ek Notlar</label>
                                    <textarea
                                        value={newCallForm.notes}
                                        onChange={(e) => setNewCallForm({ ...newCallForm, notes: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
                                <button
                                    onClick={closeAddCallModal}
                                    className="px-6 py-3 text-sm font-bold text-gray-600"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleCreateIncomingCall}
                                    className="px-8 py-3 text-sm font-black text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all active:scale-95"
                                >
                                    {selectedCall ? 'Güncellemeleri Kaydet' : 'Kaydı Oluştur'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
