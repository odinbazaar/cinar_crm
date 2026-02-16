import React from 'react'
import { X, FileText, Hash, Users, ChevronDown, DollarSign, Save } from 'lucide-react'
import type { Customer } from '../../types/sales'

interface CustomerRequestModalProps {
    showRequestModal: boolean
    setShowRequestModal: (show: boolean) => void
    requestForm: any
    setRequestForm: (form: any) => void
    customers: Customer[]
    handleCreateRequest: () => void
}

export const CustomerRequestModal: React.FC<CustomerRequestModalProps> = ({
    showRequestModal,
    setShowRequestModal,
    requestForm,
    setRequestForm,
    customers,
    handleCreateRequest
}) => {
    if (!showRequestModal) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Yeni Müşteri Talebi</h2>
                    </div>
                    <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-2 gap-8 overflow-y-auto">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Hash className="w-4 h-4" />
                                Vergi Numarası ile Ara
                            </label>
                            <input
                                type="text"
                                placeholder="Vergi numarasını girin..."
                                value={requestForm.taxNumber}
                                onChange={(e) => {
                                    const vkn = e.target.value
                                    setRequestForm({ ...requestForm, taxNumber: vkn })
                                }}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Users className="w-4 h-4" />
                                Müşteri *
                            </label>
                            <div className="relative">
                                <select
                                    value={requestForm.customerId}
                                    onChange={(e) => setRequestForm({ ...requestForm, customerId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                    required
                                >
                                    <option value="">Müşteri Seçin...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.companyName}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Ürün Tipi *</label>
                            <div className="relative">
                                <select
                                    value={requestForm.productType}
                                    onChange={(e) => setRequestForm({ ...requestForm, productType: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                >
                                    <option value="Billboard">Billboard</option>
                                    <option value="Megalight">Megalight</option>
                                    <option value="CLP">CLP Raket</option>
                                    <option value="Giantboard">Giantboard</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Ürün Detayları</label>
                            <textarea
                                rows={3}
                                placeholder="Boyut, konum tercihi vb."
                                value={requestForm.productDetails}
                                onChange={(e) => setRequestForm({ ...requestForm, productDetails: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Hash className="w-4 h-4" />
                                Adet
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={requestForm.quantity}
                                onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Notlar</label>
                            <textarea
                                rows={6}
                                placeholder="Ek notlar..."
                                value={requestForm.notes}
                                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <DollarSign className="w-4 h-4" />
                                Bütçe Kaynağı
                            </label>
                            <div className="relative">
                                <select
                                    value={requestForm.budgetSource}
                                    onChange={(e) => setRequestForm({ ...requestForm, budgetSource: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                >
                                    <option value="">Bütçe Seçin...</option>
                                    <option value="Genel Pazarlama">Genel Pazarlama</option>
                                    <option value="Tanıtım ve Etkinlik">Tanıtım ve Etkinlik</option>
                                    <option value="Lokal Reklam">Lokal Reklam</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-4 shrink-0">
                    <button
                        onClick={() => setShowRequestModal(false)}
                        className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleCreateRequest}
                        className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    )
}
