import React from 'react'
import { Users, FileText, Send, DollarSign } from 'lucide-react'
import type { Customer, Proposal } from '../../types/sales'

interface SalesStatsProps {
    customers: Customer[]
    proposals: Proposal[]
    setActiveTab: (tab: 'customers' | 'proposals' | 'sent' | 'reservations') => void
}

export const SalesStats: React.FC<SalesStatsProps> = ({
    customers,
    proposals,
    setActiveTab
}) => {
    const draftProposalsCount = proposals.filter(p => p.status === 'draft').length
    const sentProposalsCount = proposals.filter(p => p.status === 'sent' || p.status === 'approved').length
    const totalProposalValue = proposals.reduce((sum, p) => sum + p.totalAmount, 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Toplam Müşteri</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
                        <p className="text-sm text-green-600 mt-1">+2 bu hafta</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            <div
                onClick={() => setActiveTab('proposals')}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:bg-yellow-50/30 group"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Hazırlanan Teklif</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{draftProposalsCount}</p>
                        <p className="text-sm text-yellow-600 mt-1">{draftProposalsCount} taslak</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>

            <div
                onClick={() => setActiveTab('sent')}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:bg-green-50/30 group bg-gradient-to-br from-white to-green-50/30"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Gönderilen</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{sentProposalsCount}</p>
                        <p className="text-sm text-green-600 mt-1">Müşteriye iletildi</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-green-200">
                        <Send className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 bg-gradient-to-br from-white to-purple-50/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Toplam Değer</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">₺{totalProposalValue.toLocaleString()}</p>
                        <p className="text-sm text-purple-600 mt-1">Tüm teklifler</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-inner shadow-purple-200">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
            </div>
        </div>
    )
}
