import React from 'react'
import { X, Building, MapPin, Phone, StickyNote, TrendingUp, Calendar, Bell, Clock, Plus, List, Trash2 } from 'lucide-react'
import type { Customer, CustomerForm } from '../../types/sales'
import type { IncomingCall } from '../../services/incomingCallsService'

interface CustomerModalProps {
    showCustomerModal: boolean
    selectedCustomer: Customer | null
    setShowCustomerModal: (show: boolean) => void
    setSelectedCustomer: (customer: Customer | null) => void
    customerModalTab: 'company' | 'address' | 'contact' | 'notes' | 'crm'
    setCustomerModalTab: (tab: 'company' | 'address' | 'contact' | 'notes' | 'crm') => void
    customerForm: CustomerForm
    setCustomerForm: (form: CustomerForm) => void
    showCompanySuggestions: boolean
    setShowCompanySuggestions: (show: boolean) => void
    incomingCalls: IncomingCall[]
    setPendingIncomingCallId: (id: string | null) => void
    noteInput: any
    setNoteInput: (input: any) => void
    noteFilterDate: string
    setNoteFilterDate: (date: string) => void
    handleSaveCustomer: () => void
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
    showCustomerModal,
    selectedCustomer,
    setShowCustomerModal,
    setSelectedCustomer,
    customerModalTab,
    setCustomerModalTab,
    customerForm,
    setCustomerForm,
    showCompanySuggestions,
    setShowCompanySuggestions,
    incomingCalls,
    setPendingIncomingCallId,
    noteInput,
    setNoteInput,
    noteFilterDate,
    setNoteFilterDate,
    handleSaveCustomer
}) => {
    if (!showCustomerModal) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-5 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-semibold text-white">{selectedCustomer ? 'Müşteri Güncelle' : 'Yeni Müşteri Ekle'}</h2>
                    <button onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }} className="text-white/80 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 gap-1 shrink-0 overflow-x-auto">
                    <button
                        onClick={() => setCustomerModalTab('company')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${customerModalTab === 'company'
                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Building className="w-4 h-4" />
                        Şirket Bilgileri
                    </button>
                    <button
                        onClick={() => setCustomerModalTab('address')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${customerModalTab === 'address'
                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        Adres
                    </button>
                    <button
                        onClick={() => setCustomerModalTab('contact')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${customerModalTab === 'contact'
                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Phone className="w-4 h-4" />
                        İletişim
                    </button>
                    <button
                        onClick={() => setCustomerModalTab('notes')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${customerModalTab === 'notes'
                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <StickyNote className="w-4 h-4" />
                        Notlar
                    </button>
                    <button
                        onClick={() => setCustomerModalTab('crm')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${customerModalTab === 'crm'
                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        CRM & Talep
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Şirket Bilgileri Tab */}
                    {customerModalTab === 'company' && (
                        <>
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Şirket Unvanı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerForm.companyName}
                                    onChange={(e) => {
                                        setCustomerForm({ ...customerForm, companyName: e.target.value })
                                        setShowCompanySuggestions(e.target.value.length > 0)
                                    }}
                                    onFocus={() => setShowCompanySuggestions(customerForm.companyName.length > 0 || incomingCalls.length > 0)}
                                    onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Yazın veya Arayan Firmalardan seçin..."
                                />
                                {/* Arayan Firmalar Dropdown */}
                                {showCompanySuggestions && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                        {incomingCalls
                                            .filter(call =>
                                                call.company_name?.toLowerCase().includes(customerForm.companyName.toLowerCase()) ||
                                                customerForm.companyName === ''
                                            )
                                            .slice(0, 10)
                                            .map((call) => (
                                                <button
                                                    key={call.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCustomerForm({
                                                            ...customerForm,
                                                            companyName: call.company_name || '',
                                                            contactPerson: call.contact_person || customerForm.contactPerson,
                                                            phone: call.phone || customerForm.phone,
                                                            email: call.email || customerForm.email,
                                                            notes: call.notes || customerForm.notes,
                                                            requestDetail: call.request_detail || customerForm.requestDetail,
                                                            calledPhone: call.called_phone || customerForm.calledPhone,
                                                            leadSource: 'Arayan Firma',
                                                            leadStage: 'Aday'
                                                        })
                                                        setPendingIncomingCallId(call.id)
                                                        setShowCompanySuggestions(false)
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                                >
                                                    <div className="font-semibold text-gray-900">{call.company_name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                        {call.contact_person && <span>{call.contact_person}</span>}
                                                        {call.phone && <span>• {call.phone}</span>}
                                                    </div>
                                                </button>
                                            ))
                                        }
                                        {incomingCalls.filter(call =>
                                            call.company_name?.toLowerCase().includes(customerForm.companyName.toLowerCase()) ||
                                            customerForm.companyName === ''
                                        ).length === 0 && (
                                                <div className="px-4 py-3 text-gray-500 text-sm">Eşleşen kayıt bulunamadı</div>
                                            )}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticari Unvan</label>
                                    <input
                                        type="text"
                                        value={customerForm.tradeName}
                                        onChange={(e) => setCustomerForm({ ...customerForm, tradeName: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="Örn: ABC Grup"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                                    <select
                                        value={customerForm.sector}
                                        onChange={(e) => setCustomerForm({ ...customerForm, sector: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Reklam">Reklam</option>
                                        <option value="Retail">Retail</option>
                                        <option value="FMCG">FMCG</option>
                                        <option value="Gıda">Gıda</option>
                                        <option value="Eğitim">Eğitim</option>
                                        <option value="İnşaat">İnşaat</option>
                                        <option value="Otomotiv">Otomotiv</option>
                                        <option value="Aksesuar">Aksesuar</option>
                                        <option value="Dayanıklı Tüketim">Dayanıklı Tüketim</option>
                                        <option value="Sağlık">Sağlık</option>
                                        <option value="Medya">Medya</option>
                                        <option value="Finans">Finans</option>
                                        <option value="Mobilya">Mobilya</option>
                                        <option value="Sanayi">Sanayi</option>
                                        <option value="Tekstil">Tekstil</option>
                                        <option value="Turizm">Turizm</option>
                                        <option value="Perakende">Perakende</option>
                                        <option value="Üretim">Üretim</option>
                                        <option value="Hizmet">Hizmet</option>
                                        <option value="Teknoloji">Teknoloji</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                                    <input
                                        type="text"
                                        value={customerForm.taxOffice}
                                        onChange={(e) => setCustomerForm({ ...customerForm, taxOffice: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="Örn: Kordon"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                                    <input
                                        type="text"
                                        value={customerForm.taxNumber}
                                        onChange={(e) => setCustomerForm({ ...customerForm, taxNumber: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="10 haneli vergi numarası"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Adres Tab */}
                    {customerModalTab === 'address' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                <textarea
                                    value={customerForm.address}
                                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Sokak, Mahalle, Bina No"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                                    <input
                                        type="text"
                                        value={customerForm.city}
                                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="Örn: İzmir"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                                    <input
                                        type="text"
                                        value={customerForm.district}
                                        onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="Örn: Konak"
                                    />
                                </div>
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                                <input
                                    type="text"
                                    value={customerForm.postalCode}
                                    onChange={(e) => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Örn: 35000"
                                />
                            </div>
                        </>
                    )}

                    {/* İletişim Tab */}
                    {customerModalTab === 'contact' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Kişi</label>
                                <input
                                    type="text"
                                    value={customerForm.contactPerson}
                                    onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                    <input
                                        type="tel"
                                        value={customerForm.phone}
                                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="+90 (XXX) XXX XX XX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobil</label>
                                    <input
                                        type="tel"
                                        value={customerForm.mobile}
                                        onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                        placeholder="+90 5XX XXX XX XX"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                <input
                                    type="email"
                                    value={customerForm.email}
                                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Örn: info@sirket.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    type="url"
                                    value={customerForm.website}
                                    onChange={(e) => setCustomerForm({ ...customerForm, website: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Örn: www.sirket.com"
                                />
                            </div>
                        </>
                    )}

                    {/* Notlar Tab */}
                    {customerModalTab === 'notes' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-4">
                                <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                                    <StickyNote className="w-5 h-5" />
                                    <h4>Yeni Not Ekle</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-amber-700 mb-1">Not Tarihi (Otomatik)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-amber-500" />
                                            <input
                                                type="date"
                                                value={noteInput.date}
                                                onChange={(e) => setNoteInput({ ...noteInput, date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-amber-700 mb-1">Hatırlatıcı (Opsiyonel)</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Bell className="absolute left-3 top-2.5 w-4 h-4 text-amber-500" />
                                                <input
                                                    type="date"
                                                    value={noteInput.reminderDate}
                                                    onChange={(e) => setNoteInput({ ...noteInput, reminderDate: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                            <div className="relative w-32">
                                                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-amber-500" />
                                                <input
                                                    type="time"
                                                    value={noteInput.reminderTime}
                                                    onChange={(e) => setNoteInput({ ...noteInput, reminderTime: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <textarea
                                        value={noteInput.content}
                                        onChange={(e) => setNoteInput({ ...noteInput, content: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                                        placeholder="Notunuzu buraya yazın..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                                            checked={noteInput.repeat}
                                            onChange={(e) => setNoteInput({ ...noteInput, repeat: e.target.checked })}
                                        />
                                        <span className="text-xs text-amber-700 group-hover:text-amber-800 transition-colors">Tekrarlı Uyarı</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!noteInput.content.trim()) return;
                                            const notesStr = customerForm.notes || '[]';
                                            let notesArr = [];
                                            try {
                                                notesArr = notesStr.startsWith('[') ? JSON.parse(notesStr) : (notesStr ? [{ id: 'old', content: notesStr, date: 'Eski' }] : []);
                                            } catch (e) {
                                                notesArr = notesStr ? [{ id: 'old', content: notesStr, date: 'Eski' }] : [];
                                            }

                                            const newNoteObj = {
                                                id: Date.now().toString(),
                                                content: noteInput.content,
                                                date: noteInput.date,
                                                reminderDate: noteInput.reminderDate,
                                                reminderTime: noteInput.reminderTime,
                                                repeat: noteInput.repeat,
                                                isReminded: false,
                                                createdAt: new Date().toISOString()
                                            };

                                            const updatedNotes = JSON.stringify([...notesArr, newNoteObj]);
                                            setCustomerForm({ ...customerForm, notes: updatedNotes });
                                            setNoteInput({
                                                content: '',
                                                date: new Date().toISOString().split('T')[0],
                                                reminderDate: '',
                                                reminderTime: '10:00',
                                                repeat: false
                                            });
                                        }}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Notu Ekle
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                        <List className="w-4 h-4" />
                                        <h4>Kayıtlı Notlar</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Tarihe Göre Filtrele:</span>
                                        <input
                                            type="date"
                                            value={noteFilterDate}
                                            onChange={(e) => setNoteFilterDate(e.target.value)}
                                            className="px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(() => {
                                        const notesStr = customerForm.notes || '[]';
                                        let notesArr = [];
                                        try {
                                            notesArr = notesStr.startsWith('[') ? JSON.parse(notesStr) : (notesStr ? [{ id: 'old', content: notesStr, date: 'Eski' }] : []);
                                        } catch (e) {
                                            notesArr = notesStr ? [{ id: 'old', content: notesStr, date: 'Eski' }] : [];
                                        }

                                        const filtered = noteFilterDate
                                            ? notesArr.filter((n: any) => n.date === noteFilterDate)
                                            : notesArr;

                                        if (filtered.length === 0) return <p className="text-center text-gray-400 text-sm py-4">Gösterilecek not bulunmuyor.</p>;

                                        return filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((note: any) => (
                                            <div key={note.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl relative group hover:bg-white hover:border-primary-100 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                                        <span className="text-xs font-bold text-primary-700">{note.date}</span>
                                                        {note.reminderDate && (
                                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-black">
                                                                <Bell className="w-2.5 h-2.5" />
                                                                {note.reminderDate} {note.reminderTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const updated = notesArr.filter((n: any) => n.id !== note.id);
                                                            setCustomerForm({ ...customerForm, notes: JSON.stringify(updated) });
                                                        }}
                                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CRM & Talep Tab */}
                    {customerModalTab === 'crm' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Talep Detayı</label>
                                <textarea
                                    value={customerForm.requestDetail}
                                    onChange={(e) => setCustomerForm({ ...customerForm, requestDetail: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    placeholder="Müşterinin reklam talebi ile ilgili detaylar..."
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Kaynağı</label>
                                    <select
                                        value={customerForm.leadSource}
                                        onChange={(e) => setCustomerForm({ ...customerForm, leadSource: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Arayan Firma">Arayan Firma</option>
                                        <option value="Web Form">Web Form</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Referans">Referans</option>
                                        <option value="Soğuk Arama">Soğuk Arama</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Satış Aşaması</label>
                                    <select
                                        value={customerForm.leadStage}
                                        onChange={(e) => setCustomerForm({ ...customerForm, leadStage: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    >
                                        <option value="Aday">Aday</option>
                                        <option value="Tanışma">Tanışma</option>
                                        <option value="Teklif Hazırlanıyor">Teklif Hazırlanıyor</option>
                                        <option value="Teklif Gönderildi">Teklif Gönderildi</option>
                                        <option value="Pazarlık">Pazarlık</option>
                                        <option value="Kazanıldı">Kazanıldı</option>
                                        <option value="Kaybedildi">Kaybedildi</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3 justify-end shrink-0">
                    <button
                        onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSaveCustomer}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg hover:shadow-lg active:scale-95 transition-all"
                    >
                        {selectedCustomer ? 'Değişiklikleri Kaydet' : 'Müşteriyi Oluştur'}
                    </button>
                </div>
            </div>
        </div>
    )
}
