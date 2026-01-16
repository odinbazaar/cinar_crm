import { useState, useEffect } from 'react'
import { Search, FileText, Download, Eye, FileSignature, Mail, Printer, ChevronDown, Pencil } from 'lucide-react'
import { proposalsService, type Proposal } from '../services'
import { useToast } from '../hooks/useToast'
import ProposalContractModal from '../components/proposals/ProposalContractModal'
import { useNavigate } from 'react-router-dom'

export default function ContractsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [isContractModalOpen, setIsContractModalOpen] = useState(false)
    const { error } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        loadProposals()
    }, [])

    const loadProposals = async () => {
        try {
            setIsLoading(true)
            const data = await proposalsService.getAll()
            // In contracts page, we might want to focus on SENT or ACCEPTED, 
            // but let's show all for now as user said "Sözleşmeler listesi"
            setProposals(data)
        } catch (err: any) {
            error(err.message || 'Sözleşmeler yüklenirken bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredProposals = proposals.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proposal_number.includes(searchTerm)
    )

    const handleViewContract = (proposal: Proposal) => {
        setSelectedProposal(proposal)
        setIsContractModalOpen(true)
    }

    const handleProposalStatusUpdate = (id: string, status: string) => {
        setProposals(proposals.map(p => p.id === id ? { ...p, status } : p))
        if (selectedProposal?.id === id) {
            setSelectedProposal(prev => prev ? { ...prev, status } : null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Taslak</span>
            case 'SENT':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Gönderildi</span>
            case 'ACCEPTED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Onaylandı</span>
            case 'REJECTED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Reddedildi</span>
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sözleşmeler</h1>
                    <p className="text-gray-600 mt-1">Onaylanan ve aktif sözleşmeleri takip edin</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Sözleşme No, Müşteri veya Marka ara..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sözleşme Detayları</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProposals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                        Sözleşme bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredProposals.map((proposal) => (
                                    <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                    <FileSignature className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 uppercase tracking-tight">{proposal.title}</div>
                                                    <div className="text-xs text-gray-500 font-medium">#{proposal.proposal_number} • {proposal.client?.company_name || proposal.client?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{new Date(proposal.created_at).toLocaleDateString('tr-TR')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-gray-900">₺{proposal.total.toLocaleString('tr-TR')}</div>
                                            <div className="text-[10px] text-gray-400 font-bold">KDV DAHİL</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(proposal.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewContract(proposal)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-purple-100"
                                                    title="Sözleşmeyi Görüntüle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate('/proposals')}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100"
                                                    title="Teklife Git"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <ProposalContractModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                proposal={selectedProposal}
                onStatusUpdate={handleProposalStatusUpdate}
            />
        </div>
    )
}
