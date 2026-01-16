import { useState, useEffect } from 'react'
import React from 'react'
import { X, Search, Trash2, Hash } from 'lucide-react'
import { mockInventory, type InventoryItem } from '../../services/mockData'
import { clientsService, type Client } from '../../services/clientsService'
import { PRICE_LIST, getPriceForItem } from '../../services/priceList'

interface ProposalItem {
    id: string
    inventoryItemId: string
    code: string
    type: string
    description: string
    price: number
    quantity: number
    duration: number
    opBedel: number
    baskiFiyati: number
    measurements: string
    minPeriod: string
    district: string
    periodType: string
}

interface ProposalFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (proposal: any) => void
    proposal?: any
}

export default function ProposalFormModal({ isOpen, onClose, onSave, proposal }: ProposalFormModalProps) {
    const [step, setStep] = useState(1)
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClientId, setSelectedClientId] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [] as ProposalItem[],
        terms: 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir. Daha geç bildirilen iptaller için kiracı, kira bedelinin %50\'sini cezai şart olarak ödemeyi kabul ve taahhüt eder.',
        description: ''
    })

    useEffect(() => {
        if (proposal) {
            setSelectedClientId(proposal.client_id)
            // Map items back to ProposalItem format
            // In the real system, some items are grouped (OP BEDELİ, BASKI)
            // For now, let's try to extract unique items based on description and metadata
            const mappedItems: ProposalItem[] = []

            // This is a simplified mapping, might need refinement based on exact data structure
            const baseItems = proposal.items.filter((item: any) => !item.description.includes('OP. BEDELİ') && !item.description.includes('BASKI BEDELİ'))

            baseItems.forEach((bi: any) => {
                const opBedelItem = proposal.items.find((i: any) => i.description.includes('OP. BEDELİ') && i.metadata?.measurements === bi.metadata?.measurements)
                const baskiItem = proposal.items.find((i: any) => i.description.includes('BASKI BEDELİ') && i.metadata?.measurements === bi.metadata?.measurements)

                mappedItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    inventoryItemId: bi.metadata?.inventoryItemId || '',
                    code: bi.description.split(' - ')[0],
                    type: bi.metadata?.type || '',
                    description: bi.description.split(' - ')[1] || '',
                    price: bi.unit_price / (bi.metadata?.duration || 1),
                    quantity: bi.quantity,
                    duration: bi.metadata?.duration || 1,
                    opBedel: opBedelItem ? opBedelItem.unit_price : 0,
                    baskiFiyati: baskiItem ? baskiItem.unit_price : 0,
                    measurements: bi.metadata?.measurements || '',
                    minPeriod: bi.metadata?.period || '1 HAFTA',
                    district: bi.metadata?.district || '',
                    periodType: bi.metadata?.period?.includes('GÜN') ? 'GÜN' : 'HAFTA'
                })
            })

            setFormData({
                title: proposal.title,
                date: proposal.created_at.split('T')[0],
                validUntil: proposal.valid_until ? proposal.valid_until.split('T')[0] : '',
                items: mappedItems,
                terms: proposal.terms || formData.terms,
                description: proposal.description || ''
            })
        } else {
            // Reset to defaults if no proposal
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                items: [],
                terms: 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir. Daha geç bildirilen iptaller için kiracı, kira bedelinin %50\'sini cezai şart olarak ödemeyi kabul ve taahhüt eder.',
                description: ''
            })
            setSelectedClientId('')
        }
    }, [proposal])
    const [searchTerm, setSearchTerm] = useState('')
    const [taxSearch, setTaxSearch] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadClients()
        }
    }, [isOpen])

    const loadClients = async () => {
        try {
            const data = await clientsService.getAll()
            setClients(data)
        } catch (error) {
            console.error('Failed to load clients', error)
        }
    }

    const handleTaxSearch = (vkn: string) => {
        setTaxSearch(vkn)
        if (vkn.trim()) {
            const foundClient = clients.find(c => c.tax_number === vkn.trim())
            if (foundClient) {
                setSelectedClientId(foundClient.id)
            }
        }
    }

    if (!isOpen) return null

    const handleAddItem = (inventoryItem: InventoryItem) => {
        if (formData.items.some(i => i.inventoryItemId === inventoryItem.id)) return

        const priceConfig = getPriceForItem(inventoryItem.type)

        // Multiple entries for some types (e.g. OP. BEDELİ row)
        const newItem: ProposalItem = {
            id: Math.random().toString(36).substr(2, 9),
            inventoryItemId: inventoryItem.id,
            code: inventoryItem.code,
            type: inventoryItem.type,
            description: inventoryItem.address,
            price: priceConfig.unitPrice,
            quantity: 1,
            duration: 1,
            opBedel: priceConfig.opBedel,
            baskiFiyati: priceConfig.baskiFiyati,
            measurements: priceConfig.baskiAlani,
            minPeriod: priceConfig.period,
            district: inventoryItem.district,
            periodType: priceConfig.period.includes('HAFTA') ? 'HAFTA' : (priceConfig.period.includes('GÜN') ? 'GÜN' : 'AY')
        }

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }))
    }

    const handleRemoveItem = (itemId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId)
        }))
    }

    const updateItem = (itemId: string, updates: Partial<ProposalItem>) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
        }))
    }

    const filteredInventory = mockInventory.filter(item =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            const rowTotal = (item.price * item.quantity * item.duration) + (item.opBedel * item.quantity) + (item.baskiFiyati * item.quantity);
            return sum + rowTotal;
        }, 0)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const subtotal = calculateTotal();
        const payload = {
            title: formData.title,
            client_id: selectedClientId,
            created_by_id: localStorage.getItem('userId') || '3d9cfdd6-3948-4071-8e81-d422c0654fc5',
            description: formData.description,
            terms: formData.terms,
            valid_until: new Date(formData.validUntil).toISOString(),
            items: formData.items.flatMap(item => [
                {
                    description: `${item.type} - ${item.measurements}`,
                    quantity: item.quantity,
                    unit_price: item.price * item.duration, // Include duration in unit price for backend
                    total: item.price * item.quantity * item.duration,
                    metadata: { type: item.type, district: item.district, duration: item.duration, period: item.minPeriod, measurements: item.measurements }
                },
                ...(item.opBedel > 0 ? [{
                    description: `OP. BEDELİ - ${item.measurements}`,
                    quantity: item.quantity,
                    unit_price: item.opBedel,
                    total: item.opBedel * item.quantity,
                    metadata: { type: 'OP_BEDEL', district: item.district, measurements: item.measurements }
                }] : []),
                ...(item.baskiFiyati > 0 ? [{
                    description: `BASKI BEDELİ - ${item.measurements}`,
                    quantity: item.quantity,
                    unit_price: item.baskiFiyati,
                    total: item.baskiFiyati * item.quantity,
                    metadata: { type: 'BASKI', district: item.district, measurements: item.measurements }
                }] : [])
            ]),
            subtotal: subtotal,
            tax_rate: 20,
            tax_amount: subtotal * 0.2,
            total: subtotal * 1.2
        }

        onSave(payload)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Header matching image style */}
                <div className="bg-[#B91C1C] p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded">
                            <span className="text-[#B91C1C] font-bold text-xl">İAR</span>
                        </div>
                        <h2 className="text-white text-xl font-bold uppercase tracking-wider">AÇIK HAVA REKLAM TEKLİF FORMU</h2>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-red-800 p-1 rounded transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {step === 1 ? (
                        <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Genel Bilgiler</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Hash className="w-4 h-4 inline mr-2 text-red-500" />
                                            Vergi Numarası ile Ara
                                        </label>
                                        <input
                                            type="text"
                                            value={taxSearch}
                                            onChange={(e) => handleTaxSearch(e.target.value)}
                                            placeholder="Vergi numarasını girin..."
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
                                        <select
                                            required
                                            value={selectedClientId}
                                            onChange={e => setSelectedClientId(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        >
                                            <option value="">Müşteri Seçin</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.company_name || client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teklif Başlığı</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                                        placeholder="Örn: 2025 Yaz Kampanyası"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Geçerlilik</label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full gap-6">
                            <div className="flex gap-6 h-[500px]">
                                {/* Inventory Picker */}
                                <div className="w-1/3 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
                                    <div className="p-4 border-b bg-gray-50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Kod veya lokasyon ara..."
                                                className="w-full pl-9 p-2 border border-gray-300 rounded-full text-sm"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {filteredInventory.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleAddItem(item)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.items.some(i => i.inventoryItemId === item.id)
                                                    ? 'bg-red-50 border-red-200 ring-1 ring-red-200'
                                                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900">{item.code}</div>
                                                        <div className="text-xs text-gray-500">{item.district} / {item.neighborhood}</div>
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">{item.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Table View - Matching Screenshot */}
                                <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm overflow-hidden">
                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#B91C1C] text-white text-[10px] uppercase font-bold sticky top-0">
                                                    <th className="p-2 border-r border-red-800">Şehir/İlçe</th>
                                                    <th className="p-2 border-r border-red-800">Ürün</th>
                                                    <th className="p-2 border-r border-red-800">Ölçü</th>
                                                    <th className="p-2 border-r border-red-800">Adet</th>
                                                    <th className="p-2 border-r border-red-800 w-20">Süre</th>
                                                    <th className="p-2 border-r border-red-800">Dönem</th>
                                                    <th className="p-2 border-r border-red-800">Birim Fiyat</th>
                                                    <th className="p-2">Toplam</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[11px]">
                                                {formData.items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="p-10 text-center text-gray-400 italic">Henüz ürün seçilmedi.</td>
                                                    </tr>
                                                ) : (
                                                    formData.items.map(item => (
                                                        <React.Fragment key={item.id}>
                                                            <tr className="border-b group">
                                                                <td className="p-2 border-r font-medium">{item.district}</td>
                                                                <td className="p-2 border-r font-bold">{item.type}</td>
                                                                <td className="p-2 border-r">{item.measurements}</td>
                                                                <td className="p-2 border-r">
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={e => updateItem(item.id, { quantity: Number(e.target.value) })}
                                                                        className="w-10 border-0 bg-transparent p-0 focus:ring-0"
                                                                    />
                                                                </td>
                                                                <td className="p-2 border-r">
                                                                    <input
                                                                        type="number"
                                                                        value={item.duration}
                                                                        onChange={e => updateItem(item.id, { duration: Number(e.target.value) })}
                                                                        className="w-10 border-0 bg-transparent p-0 focus:ring-0"
                                                                    />
                                                                </td>
                                                                <td className="p-2 border-r">{item.minPeriod}</td>
                                                                <td className="p-2 border-r">
                                                                    <input
                                                                        type="number"
                                                                        value={item.price}
                                                                        onChange={e => updateItem(item.id, { price: Number(e.target.value) })}
                                                                        className="w-16 border-0 bg-transparent p-0 focus:ring-0 font-bold"
                                                                    />
                                                                </td>
                                                                <td className="p-2 font-bold flex justify-between items-center">
                                                                    <span>₺{(item.price * item.quantity * item.duration).toLocaleString('tr-TR')}</span>
                                                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                                                                </td>
                                                            </tr>
                                                            {item.opBedel > 0 && (
                                                                <tr className="border-b bg-gray-50/50 text-gray-500">
                                                                    <td className="p-2 border-r">{item.district}</td>
                                                                    <td className="p-2 border-r">OP. BEDELİ</td>
                                                                    <td className="p-2 border-r">{item.measurements}</td>
                                                                    <td className="p-2 border-r">{item.quantity}</td>
                                                                    <td className="p-2 border-r">1</td>
                                                                    <td className="p-2 border-r">{item.minPeriod}</td>
                                                                    <td className="p-2 border-r">
                                                                        <input
                                                                            type="number"
                                                                            value={item.opBedel}
                                                                            onChange={e => updateItem(item.id, { opBedel: Number(e.target.value) })}
                                                                            className="w-16 border-0 bg-transparent p-0 focus:ring-0"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2">₺{(item.opBedel * item.quantity).toLocaleString('tr-TR')}</td>
                                                                </tr>
                                                            )}
                                                            {item.baskiFiyati > 0 && (
                                                                <tr className="border-b bg-gray-50/50 text-gray-500">
                                                                    <td className="p-2 border-r">{item.district}</td>
                                                                    <td className="p-2 border-r">BASKI BEDELİ</td>
                                                                    <td className="p-2 border-r">{item.measurements}</td>
                                                                    <td className="p-2 border-r">{item.quantity}</td>
                                                                    <td className="p-2 border-r">1</td>
                                                                    <td className="p-2 border-r">{item.minPeriod}</td>
                                                                    <td className="p-2 border-r">
                                                                        <input
                                                                            type="number"
                                                                            value={item.baskiFiyati}
                                                                            onChange={e => updateItem(item.id, { baskiFiyati: Number(e.target.value) })}
                                                                            className="w-16 border-0 bg-transparent p-0 focus:ring-0"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2">₺{(item.baskiFiyati * item.quantity).toLocaleString('tr-TR')}</td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </tbody>
                                            {formData.items.length > 0 && (
                                                <tfoot>
                                                    <tr className="bg-gray-100 font-bold border-t-2 border-[#B91C1C]">
                                                        <td colSpan={7} className="p-2 text-right uppercase tracking-wider text-[10px]">GENEL TOPLAM (KDV HARİÇ)</td>
                                                        <td className="p-2 text-[#B91C1C] text-sm">₺{calculateTotal().toLocaleString('tr-TR')}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                <label className="block text-xs font-bold text-red-700 uppercase">Yasal Uyarı / Notlar</label>
                                <textarea
                                    value={formData.terms}
                                    onChange={e => setFormData({ ...formData, terms: e.target.value })}
                                    className="w-full h-24 p-2 text-[10px] text-gray-600 border border-gray-200 rounded focus:ring-1 focus:ring-red-500 italic"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-between bg-white">
                    {step === 2 ? (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded font-bold hover:bg-gray-200 transition-colors"
                        >
                            GERİ
                        </button>
                    ) : (
                        <div></div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded font-bold hover:bg-gray-50 transition-colors"
                        >
                            İPTAL
                        </button>
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!selectedClientId || !formData.title}
                                className="px-8 py-2 bg-[#B91C1C] text-white rounded font-bold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                            >
                                İLERİ
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={formData.items.length === 0}
                                className="px-8 py-2 bg-[#B91C1C] text-white rounded font-bold hover:bg-red-800 transition-colors shadow-md disabled:opacity-50"
                            >
                                {proposal ? "GÜNCELLE" : "TEKLİFİ OLUŞTUR"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


