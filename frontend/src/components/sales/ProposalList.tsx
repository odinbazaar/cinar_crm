import React from 'react'
import { FileText, CheckCircle, Mail, MapPin } from 'lucide-react'
import type { Proposal, Customer, ProposalItem } from '../../types/sales'

interface ProposalListProps {
    proposals: Proposal[]
    customers: Customer[]
    handleApproveProposal: (id: string) => void
    setSelectedCustomer: (customer: Customer | null) => void
    setSelectedProposal: (proposal: Proposal | null) => void
    setProposalItems: (items: ProposalItem[]) => void
    setIsBlockList: (isBlock: boolean) => void
    setShowProposalModal: (show: boolean) => void
    setIsLocationModalOpen: (open: boolean) => void
    setIsContractModalOpen: (open: boolean) => void
}

export const ProposalList: React.FC<ProposalListProps> = ({
    proposals,
    customers,
    handleApproveProposal,
    setSelectedCustomer,
    setSelectedProposal,
    setProposalItems,
    setIsBlockList,
    setShowProposalModal,
    setIsLocationModalOpen,
    setIsContractModalOpen
}) => {
    return (
        <div className="space-y-4 text-left">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Bütçe Teklifleri</h3>
                        <p className="text-sm text-gray-500">Hazırlanan ve revize bekleyen tüm teklifler</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {proposals.length > 0 ? (
                        proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((proposal) => (
                            <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${proposal.status === 'draft' ? 'bg-yellow-100' :
                                        proposal.status === 'sent' ? 'bg-green-100' :
                                            proposal.status === 'approved' ? 'bg-blue-100' : 'bg-gray-100'
                                        } rounded-lg flex items-center justify-center`}>
                                        <FileText className={`w-5 h-5 ${proposal.status === 'draft' ? 'text-yellow-600' :
                                            proposal.status === 'sent' ? 'text-green-600' :
                                                proposal.status === 'approved' ? 'text-blue-600' : 'text-gray-600'
                                            } `} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-gray-900">{proposal.proposalNumber ? `${proposal.proposalNumber} - ` : ''}{proposal.customerName}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                proposal.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                    proposal.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                } `}>
                                                {proposal.status === 'draft' ? 'TASLAK' :
                                                    proposal.status === 'sent' ? 'GÖNDERİLDİ' :
                                                        proposal.status === 'approved' ? 'ONAYLANDI' : proposal.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">Oluşturma: {proposal.createdAt}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">₺{proposal.totalAmount.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400">KDV Dahil</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {proposal.status === 'sent' && (
                                            <button
                                                onClick={() => handleApproveProposal(proposal.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Onayla
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                const customer = customers.find(c => c.id === proposal.customerId)
                                                if (customer) {
                                                    setSelectedCustomer(customer)
                                                }
                                                setSelectedProposal(proposal)
                                                setProposalItems([...proposal.items])
                                                setIsBlockList(proposal.isBlockList)
                                                setShowProposalModal(true)
                                            }}
                                            className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedProposal(proposal)
                                                setIsLocationModalOpen(true)
                                            }}
                                            className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Yer Talebi
                                        </button>
                                        {proposal.status === 'approved' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedProposal(proposal)
                                                    setIsContractModalOpen(true)
                                                }}
                                                className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                Sözleşme Hazırla
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            Henüz bütçe teklifi bulunmuyor.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
