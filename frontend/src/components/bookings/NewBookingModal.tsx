import { useState, useEffect } from 'react'
import { X, Calendar, MapPin, FileText, CheckCircle2 } from 'lucide-react'
import { type InventoryItem } from '../../services/inventoryService'
import { type Proposal } from '../../services/proposalsService'
import { proposalsService } from '../../services/proposalsService'

interface NewBookingModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (bookingData: any) => void
    initialData?: any
    inventory: InventoryItem[]
    proposals?: Proposal[]
}

export default function NewBookingModal({ isOpen, onClose, onSubmit, initialData, inventory, proposals = [] }: NewBookingModalProps) {
    const [formData, setFormData] = useState({
        clientName: '',
        selectedNetwork: '',
        inventoryItemId: '',
        startDate: '',
        endDate: '',
        status: 'OPTION',
        notes: '',
        proposal_id: ''
    })
    const [isLoadingProposal, setIsLoadingProposal] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Find network of the initial item if available
                const initialItem = inventory.find(i => i.id === initialData.inventory_item_id)
                setFormData({
                    clientName: initialData.client?.name || initialData.clientName || '',
                    selectedNetwork: initialItem?.network || '',
                    inventoryItemId: initialData.inventory_item_id || '',
                    startDate: initialData.start_date || initialData.startDate || '',
                    endDate: initialData.end_date || initialData.endDate || '',
                    status: initialData.status || 'OPTION',
                    notes: initialData.notes || '',
                    proposal_id: initialData.proposal_id || ''
                })
            } else {
                setFormData({
                    clientName: '',
                    selectedNetwork: '',
                    inventoryItemId: '',
                    startDate: '',
                    endDate: '',
                    status: 'OPTION',
                    notes: '',
                    proposal_id: ''
                })
            }
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        onClose()
    }

    const handleProposalChange = async (proposalId: string) => {
        if (!proposalId) {
            setFormData(prev => ({ ...prev, proposal_id: '' }))
            return
        }

        try {
            setIsLoadingProposal(true)
            const proposal = await proposalsService.getOne(proposalId)

            // Auto-fill from proposal
            const updates: any = {
                proposal_id: proposalId,
                clientName: proposal.client?.company_name || proposal.client?.name || proposal.title,
                notes: `Teklif No: ${proposal.proposal_number}\nBağımlı Teklif: ${proposal.title}`,
                status: 'OPTION'
            }

            // If proposal has items, try to find matching network
            if (proposal.items && proposal.items.length > 0) {
                const firstItem = proposal.items[0]
                const codeMatch = firstItem.description.split(' - ')[0]
                const matchingItem = inventory.find(i => i.code === codeMatch)
                if (matchingItem && matchingItem.network) {
                    updates.selectedNetwork = matchingItem.network
                    updates.inventoryItemId = matchingItem.id
                }
            }

            // Set dates from proposal if available
            if (proposal.created_at) {
                const start = new Date(proposal.created_at)
                updates.startDate = start.toISOString().split('T')[0]

                const end = new Date(start)
                end.setMonth(end.getMonth() + 1) // Default to 1 month
                updates.endDate = end.toISOString().split('T')[0]
            }

            setFormData(prev => ({ ...prev, ...updates }))
        } catch (error) {
            console.error('Failed to load proposal details:', error)
        } finally {
            setIsLoadingProposal(false)
        }
    }

    // Get unique networks - restricted to 1, 2, 3 as requested
    const networks = ['1', '2', '3']

    const itemsInSelectedNetwork = inventory.filter(i => i.network === formData.selectedNetwork)

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon Oluştur'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Proposal Selection */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                            <label className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-2">
                                <FileText className="w-4 h-4" />
                                Tekliften Bilgi Çek (Opsiyonel)
                            </label>
                            <select
                                className="input bg-white border-blue-200 focus:ring-blue-500"
                                value={formData.proposal_id}
                                onChange={e => handleProposalChange(e.target.value)}
                                disabled={isLoadingProposal}
                            >
                                <option value="">Bir Teklif Seçin...</option>
                                {proposals.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.proposal_number} - {p.client?.name || p.title}
                                    </option>
                                ))}
                            </select>
                            {formData.proposal_id && (
                                <p className="text-[10px] text-blue-600 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Teklif bilgileri otomatik olarak dolduruldu.
                                </p>
                            )}
                        </div>

                        {/* Client Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Müşteri / Kampanya Adı
                            </label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="Örn: ABC İnşaat Lansman"
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                            />
                        </div>

                        {/* Network Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Network Seçimi
                                </label>
                                <select
                                    required
                                    className="input"
                                    value={formData.selectedNetwork}
                                    onChange={e => setFormData({ ...formData, selectedNetwork: e.target.value, inventoryItemId: '' })}
                                >
                                    <option value="">Bir Network Seçiniz</option>
                                    {networks.map(network => (
                                        <option key={network} value={network!}>
                                            Network {network} ({inventory.filter(i => i.network === network).length} Ünite)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Envanter Seçimi
                                </label>
                                <select
                                    className="input"
                                    value={formData.inventoryItemId}
                                    onChange={e => setFormData({ ...formData, inventoryItemId: e.target.value })}
                                >
                                    <option value="">Tüm Üniteler (Toplu Seçim)</option>
                                    {itemsInSelectedNetwork.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.code} - {item.type} ({item.neighborhood})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.selectedNetwork && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-start gap-2 text-sm text-blue-700 border border-blue-100">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {formData.inventoryItemId ? (
                                    <span>Seçili Ünite: <strong>{inventory.find(i => i.id === formData.inventoryItemId)?.code}</strong> - {inventory.find(i => i.id === formData.inventoryItemId)?.address}</span>
                                ) : (
                                    <span>Network {formData.selectedNetwork} içindeki <strong>{itemsInSelectedNetwork.length}</strong> üniteye toplu rezervasyon yapılacaktır.</span>
                                )}
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlangıç Tarihi
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        required
                                        className="input pl-10"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bitiş Tarihi
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="date"
                                        required
                                        className="input pl-10"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Durum
                                </label>
                                <select
                                    className="input"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="OPTION">Opsiyonlu</option>
                                    <option value="CONFIRMED">Kesinleşmiş</option>
                                    <option value="CANCELLED">İptal Edildi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notlar
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ek notlar..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                {initialData ? 'Değişiklikleri Kaydet' : 'Rezervasyon Oluştur'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
