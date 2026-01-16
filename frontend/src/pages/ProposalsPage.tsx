import { useState, useEffect } from 'react'
import { Plus, Search, FileText, Download, Eye, MoreVertical, Send, Upload, FileSignature, MapPin, Mail, Printer, ChevronDown, Pencil } from 'lucide-react'
import { proposalsService, type Proposal } from '../services'
import { useToast } from '../hooks/useToast'
import ProposalFormModal from '../components/proposals/ProposalFormModal'
import ProposalContractModal from '../components/proposals/ProposalContractModal'
import LocationRequestModal from '../components/proposals/LocationRequestModal'
import DataImportModal from '../components/common/DataImportModal'

import { useNavigate, Link } from 'react-router-dom'

export default function ProposalsPage() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [isContractModalOpen, setIsContractModalOpen] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const { success, error } = useToast()

    useEffect(() => {
        loadProposals()
    }, [])

    const loadProposals = async () => {
        try {
            setIsLoading(true)
            const data = await proposalsService.getAll()
            setProposals(data)
        } catch (err: any) {
            console.error('Failed to load proposals:', err)
            // Fallback to mock data for testing/demo if backend fails
            setProposals([
                {
                    id: 'mock-1',
                    proposal_number: 'PROP-2024-001',
                    title: 'Yaz Kampanyası (Mock)',
                    client_id: '1',
                    client: {
                        id: '1',
                        name: 'Test Company',
                        company_name: 'Test Company A.Ş.',
                        address: '123 Test St, Izmir',
                        phone: '555-123-4567',
                        email: 'test@company.com',
                        created_at: '',
                        updated_at: '',
                        status: 'active',
                        is_active: true
                    } as any,
                    created_by_id: '1',
                    status: 'DRAFT',
                    subtotal: 45000,
                    tax_rate: 20,
                    tax_amount: 9000,
                    total: 54000,
                    created_at: new Date(),
                    updated_at: new Date(),
                    items: [
                        {
                            id: 'i1',
                            proposal_id: 'mock-1',
                            description: 'BB0101 - Billboard',
                            quantity: 3,
                            unit_price: 15000,
                            total: 45000,
                            order: 0
                        }
                    ]
                }
            ] as any)
            error('Backend bağlantı hatası - Mock veri gösteriliyor')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredProposals = proposals.filter(proposal => {
        const cleanSearch = searchTerm.toLowerCase().replace(/[\s-]/g, '');
        const matchesSearch =
            (proposal.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.proposal_number.toLowerCase().replace(/[\s-]/g, '').includes(cleanSearch) ||
            proposal.title.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = statusFilter === 'ALL' || proposal.status === statusFilter

        return matchesSearch && matchesFilter
    })

    const handleCreateProposal = async (newProposalData: any) => {
        try {
            if (editingProposal) {
                const updatedProposal = await proposalsService.update(editingProposal.id, newProposalData)
                setProposals(proposals.map(p => p.id === editingProposal.id ? updatedProposal : p))
                success('Teklif başarıyla güncellendi')
            } else {
                const newProposal = await proposalsService.create(newProposalData)
                setProposals([newProposal, ...proposals])
                success('Teklif başarıyla oluşturuldu')
            }
            setIsModalOpen(false)
            setEditingProposal(null)
        } catch (err: any) {
            console.error('Failed to save proposal:', err)
            error(err.message || 'Teklif işlenirken bir hata oluştu')
        }
    }

    const handleEditClick = (proposal: Proposal) => {
        setEditingProposal(proposal)
        setIsModalOpen(true)
    }

    const handleSendProposal = async (id: string) => {
        try {
            await proposalsService.updateStatus(id, 'SENT')
            setProposals(proposals.map(p => p.id === id ? { ...p, status: 'SENT' } : p))
            success('Teklif başarıyla gönderildi')
        } catch (err: any) {
            console.error('Failed to send proposal:', err)
            error(err.message || 'Teklif gönderilirken bir hata oluştu')
        }
    }

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

    const handleCreateLocationRequest = (proposal: Proposal) => {
        setSelectedProposal(proposal)
        setIsLocationModalOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <span className="badge badge-warning">Taslak</span>
            case 'SENT':
                return <span className="badge badge-info">Gönderildi</span>
            case 'ACCEPTED':
                return <span className="badge badge-success">Onaylandı</span>
            case 'REJECTED':
                return <span className="badge badge-danger">Reddedildi</span>
            default:
                return <span className="badge bg-gray-100 text-gray-800">Bilinmiyor</span>
        }
    }

    const handleDataImport = async (data: Record<string, any>[]) => {
        console.log('Importing proposal data:', data)
        // Import each row to the database
        for (const item of data) {
            try {
                await proposalsService.create(item as any)
            } catch (err) {
                console.error('Failed to import proposal:', item, err)
            }
        }
        // Refresh the proposals list
        await loadProposals()
        success('Veriler başarıyla içe aktarıldı')
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
                    <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
                    <p className="text-gray-600 mt-1">Müşteri tekliflerini yönetin ve takip edin</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/contracts"
                        className="btn btn-secondary flex items-center gap-2 bg-purple-600 text-white border-purple-700 hover:bg-purple-700 shadow-sm no-underline"
                    >
                        <FileSignature className="w-4 h-4" />
                        Sözleşmeler Sayfası
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="btn btn-secondary flex items-center gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                        >
                            <FileText className="w-4 h-4" />
                            Şablonlar
                            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                        Standart Sözleşme
                                    </div>
                                    <a
                                        href="/IAR_SOZLESME.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Görüntüle (PDF)
                                    </a>
                                    <a
                                        href="/IAR_SOZLESME.pdf"
                                        download="IAR_SOZLESME.pdf"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        İndir (PDF)
                                    </a>

                                    <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mt-2 mb-1">
                                        Tevkifatlı Sözleşme
                                    </div>
                                    <a
                                        href="/IAR_SOZLESME_TEVKIFATLI.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 text-red-500" />
                                        Görüntüle (PDF)
                                    </a>
                                    <a
                                        href="/IAR_SOZLESME_TEVKIFATLI.pdf"
                                        download="IAR_SOZLESME_TEVKIFATLI.pdf"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4 text-red-500" />
                                        İndir (PDF)
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Veri İçe Aktar
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Teklif Oluştur
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Teklif No (örn: 092430), Müşteri veya Başlık"
                            className="input pl-10 focus:ring-2 focus:ring-red-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setStatusFilter('DRAFT')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'DRAFT' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                        >
                            Taslak
                        </button>
                        <button
                            onClick={() => setStatusFilter('SENT')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'SENT' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                        >
                            Gönderildi
                        </button>
                        <button
                            onClick={() => setStatusFilter('ACCEPTED')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'ACCEPTED' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            Onaylandı
                        </button>
                    </div>
                </div>
            </div>

            {/* Proposals Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teklif Detayları</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProposals.map((proposal) => (
                                <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{proposal.title}</div>
                                                <div className="text-sm text-gray-500">{proposal.client?.name || 'N/A'} • {proposal.proposal_number}</div>
                                                <div className="text-xs text-gray-400 mt-1">{proposal.items?.length || 0} Kalem Ürün</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{new Date(proposal.created_at).toLocaleDateString('tr-TR')}</div>
                                        {proposal.valid_until && (
                                            <div className="text-xs text-gray-500">Geçerlilik: {new Date(proposal.valid_until).toLocaleDateString('tr-TR')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">
                                            ₺{proposal.total.toLocaleString('tr-TR')}
                                        </div>
                                        <div className="text-xs text-gray-500">KDV Dahil</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(proposal.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(proposal)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleViewContract(proposal)}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Sözleşme"
                                            >
                                                <FileSignature className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Görüntüle">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="İndir">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {proposal.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleSendProposal(proposal.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Gönder"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            )}
                                            {proposal.status === 'SENT' && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleSendProposal(proposal.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Tekrar Gönder"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCreateLocationRequest(proposal)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                                                        title="Yer Talebi Oluştur"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProposalFormModal
                isOpen={isModalOpen}
                proposal={editingProposal}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingProposal(null)
                }}
                onSave={handleCreateProposal}
            />

            <ProposalContractModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                proposal={selectedProposal}
                onStatusUpdate={handleProposalStatusUpdate}
            />

            <LocationRequestModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                proposal={selectedProposal}
                onComplete={() => {
                    if (selectedProposal) {
                        handleProposalStatusUpdate(selectedProposal.id, 'ACCEPTED')
                    }
                }}
            />

            <DataImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleDataImport}
                entityType="proposal"
                title="Teklif Verisi İçe Aktar"
            />
        </div>
    )
}
