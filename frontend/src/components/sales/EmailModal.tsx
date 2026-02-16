import React from 'react'
import { X, Send } from 'lucide-react'
import type { Customer, Proposal } from '../../types/sales'

interface EmailModalProps {
    showEmailModal: boolean
    setShowEmailModal: (show: boolean) => void
    selectedProposal: Proposal | null
    selectedCustomer: Customer | null
    selectedSenderEmail: string
    setSelectedSenderEmail: (email: string) => void
    emailAccounts: { value: string, label: string }[]
    handleSendEmail: () => void
    grandTotal: number
    durationWeeks: number
}

export const EmailModal: React.FC<EmailModalProps> = ({
    showEmailModal,
    setShowEmailModal,
    selectedProposal,
    selectedCustomer,
    selectedSenderEmail,
    setSelectedSenderEmail,
    emailAccounts,
    handleSendEmail,
    grandTotal,
    durationWeeks
}) => {
    if (!showEmailModal || (!selectedProposal && !selectedCustomer)) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Teklifi E-posta ile Gönder</h3>
                            <p className="text-sm text-gray-500">{selectedSenderEmail} üzerinden</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEmailModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {selectedProposal && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Teklif Detayı</h4>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-700">{selectedProposal.customerName}</span>
                                <span className="text-lg font-bold text-primary-600">₺{grandTotal.toLocaleString()}</span>
                                <span className="text-xs text-gray-400">{durationWeeks} Hafta - KDV Dahil</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Gönderen Hesap</label>
                        <div className="grid grid-cols-1 gap-2">
                            {emailAccounts.map(account => (
                                <button
                                    key={account.value}
                                    onClick={() => setSelectedSenderEmail(account.value)}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selectedSenderEmail === account.value
                                        ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{account.label}</span>
                                    {selectedSenderEmail === account.value && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Alıcı E-posta</label>
                        <input
                            type="email"
                            id="recipientEmail"
                            defaultValue={selectedCustomer?.email || ''}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                            placeholder="ornek@sirket.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Ek Not (Opsiyonel)</label>
                        <textarea
                            id="emailMessage"
                            rows={4}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                            placeholder="Teklif hakkında eklemek istediğiniz bir not var mı?"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
                    <button
                        onClick={() => setShowEmailModal(false)}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSendEmail}
                        className="flex-[2] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 transition-all"
                    >
                        <Send className="w-4 h-4" />
                        Teklifi Gönder
                    </button>
                </div>
            </div>
        </div>
    )
}
