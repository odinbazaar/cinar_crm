import { useState, useEffect } from 'react'
import { X, Search, Check, AlertCircle, Calendar, RefreshCw } from 'lucide-react'
import type { Proposal } from '../../services/proposalsService'
import { reservationsData } from '../../data/reservations'
import { useToast } from '../../hooks/useToast'

interface LocationRequestModalProps {
    isOpen: boolean
    onClose: () => void
    proposal: Proposal | null
    onComplete?: () => void
}

interface Location {
    id: string
    yil: number
    ay: string
    hafta: string
    koordinat: string
    ilce: string
    semt: string
    adres: string
    kod: string
    network: number
    marka1Opsiyon: string
    marka2Opsiyon: string
    marka3Opsiyon: string
    marka4Opsiyon: string
    durum: 'OPSİYON' | 'KESİN' | 'BOŞ'
    productType: 'BB' | 'CLP' | 'ML' | 'LED' | 'GB' | 'MB' | 'KB'
}

export default function LocationRequestModal({ isOpen, onClose, proposal, onComplete }: LocationRequestModalProps) {
    const { success, error, info } = useToast()
    const [step, setStep] = useState<1 | 2>(1)
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [requestData, setRequestData] = useState({
        brandName: '',
        year: 2025,
        month: 'Ocak',
        week: '06.01.2025',
        network: 1,
        productType: 'BB' as any,
        quantity: 10
    })

    // Get all product types for the dropdown
    const productTypes = (() => {
        const saved = localStorage.getItem('productPrices')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (e) {
                console.error('Error parsing productPrices:', e)
            }
        }
        return [
            { code: 'BB', name: 'Billboard' },
            { code: 'CLP', name: 'CLP Raket' },
            { code: 'ML', name: 'Megalight' },
            { code: 'LED', name: 'LED Ekran' },
            { code: 'GB', name: 'Giantboard' },
            { code: 'MB', name: 'Megaboard' },
            { code: 'KB', name: 'Kuleboard' },
        ]
    })()

    // Sync form with proposal when it changes
    useEffect(() => {
        if (proposal && isOpen) {
            const firstItem = proposal.items && proposal.items.length > 0 ? proposal.items[0] : null;
            const totalQty = proposal.items?.reduce((acc, item) => acc + item.quantity, 0) || 10;

            // Try to parse month from title or description if needed, otherwise default to Ocak
            let initialMonth = 'Ocak';
            let initialYear = 2026;
            let initialWeek = '05.01.2026'; // Standard starting week

            const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

            // If proposal has weekInfo (from SalesPage), parse it
            // Format: "Ocak 1. Hafta - 1 Hafta"
            const weekInfo = (proposal as any).weekInfo;
            if (weekInfo) {
                months.forEach(m => {
                    if (weekInfo.includes(m)) initialMonth = m;
                });

                // Try to find week number
                const weekMatch = weekInfo.match(/(\d+)\.\s*Hafta/);
                if (weekMatch) {
                    const weekNum = parseInt(weekMatch[1]);
                    const d = new Date(initialYear, months.indexOf(initialMonth), 1 + (weekNum - 1) * 7);
                    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    initialWeek = `${day}.${month}.${initialYear}`;
                }
            } else {
                // Fallback to title check
                months.forEach(m => {
                    if (proposal.title?.includes(m)) initialMonth = m;
                });
            }

            setRequestData({
                brandName: proposal.client?.company_name || proposal.client?.name || '',
                year: initialYear,
                month: initialMonth,
                week: initialWeek,
                network: 1,
                productType: (firstItem?.description || 'BB') as any,
                quantity: totalQty
            })
            setStep(1)
        }
    }, [proposal, isOpen])

    // Update week when year changes
    useEffect(() => {
        if (!isOpen) return;
        const d = new Date(requestData.year, 0, 1);
        while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dateStr = `${day}.${month}.${requestData.year}`;
        setRequestData(prev => ({ ...prev, week: dateStr }));
    }, [requestData.year, isOpen])

    const [results, setResults] = useState<{
        available: any[]
        options: any[]
        occupied: any[]
    }>({ available: [], options: [], occupied: [] })

    if (!isOpen || !proposal) return null

    const handleCheckAvailability = () => {
        setIsLoading(true)

        // Check against current inventory from localStorage
        setTimeout(() => {
            const savedInventory = localStorage.getItem('inventoryLocations')
            let currentInventory = []
            if (savedInventory) {
                try {
                    currentInventory = JSON.parse(savedInventory)
                } catch (e) {
                    currentInventory = reservationsData
                }
            } else {
                currentInventory = reservationsData
            }

            const allLocations = (currentInventory as any[]).map(loc => ({
                ...loc,
                durum: (loc.durum === 'KESİN' || loc.durum === 'OPSİYON' || loc.durum === 'BOŞ') ? loc.durum : 'BOŞ'
            })) as Location[]

            const matching = allLocations.filter(loc =>
                loc.yil === requestData.year &&
                loc.ay === requestData.month &&
                loc.hafta === requestData.week &&
                loc.network === requestData.network &&
                loc.productType === requestData.productType
            )

            const available = matching.filter(l => l.durum === 'BOŞ').slice(0, requestData.quantity)
            const remainingQty = requestData.quantity - available.length

            const options = matching.filter(l =>
                l.durum === 'OPSİYON' &&
                (!l.marka2Opsiyon || !l.marka3Opsiyon || !l.marka4Opsiyon)
            ).slice(0, remainingQty)

            const occupied = matching.filter(l => l.durum === 'KESİN')

            setResults({ available, options, occupied })
            setStep(2)
            setIsLoading(false)

            if (matching.length === 0) {
                info(`Seçilen dönem (${requestData.year} - ${requestData.week}) için henüz envanter oluşturulmamış. "Talebi İşle" dediğinizde otomatik oluşturulacaktır.`)
            } else {
                info(`${available.length} boş yer, ${options.length} opsiyonel yer bulundu.`)
            }
        }, 1500)
    }

    const handleCreateReservations = () => {
        if (!proposal) return
        setIsLoading(true)
        // Simulate saving
        setTimeout(() => {
            try {
                // Save to localStorage so ReservationsPage can see it
                const newRequest = {
                    id: `REQ-${Date.now()}`,
                    proposalId: proposal.id,
                    proposal_number: proposal.proposal_number || proposal.id,
                    customerName: proposal.client?.company_name || proposal.client?.name || 'Bilinmeyen Müşteri',
                    brandName: requestData.brandName,
                    productType: requestData.productType,
                    year: requestData.year,
                    month: requestData.month,
                    week: requestData.week,
                    network: requestData.network,
                    quantity: requestData.quantity,
                    availableCount: (results.available || []).length,
                    optionsCount: (results.options || []).length,
                    selectedLocations: [...(results.available || []), ...(results.options || [])],
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }

                const storageKey = 'reservationRequests'
                const existingRequestsStr = localStorage.getItem(storageKey)
                let existingRequests = []
                if (existingRequestsStr) {
                    try {
                        existingRequests = JSON.parse(existingRequestsStr)
                        if (!Array.isArray(existingRequests)) existingRequests = []
                    } catch (e) {
                        console.error('Error parsing existing requests:', e)
                        existingRequests = []
                    }
                }

                localStorage.setItem(storageKey, JSON.stringify([newRequest, ...existingRequests]))

                // Trigger a storage event manually for the same window to react
                window.dispatchEvent(new StorageEvent('storage', {
                    key: storageKey,
                    newValue: JSON.stringify([newRequest, ...existingRequests])
                }))

                setIsLoading(false)
                success('Rezervasyon talebi başarıyla iletildi.')
                if (onComplete) onComplete()
                onClose()
            } catch (error) {
                console.error('Error in handleCreateReservations:', error)
                setIsLoading(false)
                alert('Talep iletilirken bir hata oluştu. Lütfen tekrar deneyin.')
            }
        }, 800)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Yer Listesi Talebi Oluştur</h2>
                        <p className="text-sm text-gray-500">{proposal.proposal_number} - {proposal.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Marka Adı</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={requestData.brandName}
                                        onChange={e => setRequestData({ ...requestData, brandName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ürün Tipi</label>
                                    <select
                                        className="input"
                                        value={requestData.productType}
                                        onChange={e => setRequestData({ ...requestData, productType: e.target.value as any })}
                                    >
                                        {productTypes.map((pt: any) => (
                                            <option key={pt.code} value={pt.code}>
                                                {pt.name} ({pt.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Yıl</label>
                                    <select
                                        className="input"
                                        value={requestData.year}
                                        onChange={e => setRequestData({ ...requestData, year: parseInt(e.target.value) })}
                                    >
                                        <option value={2024}>2024</option>
                                        <option value={2025}>2025</option>
                                        <option value={2026}>2026</option>
                                        <option value={2027}>2027</option>
                                        <option value={2028}>2028</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ay</label>
                                    <select
                                        className="input"
                                        value={requestData.month}
                                        onChange={e => setRequestData({ ...requestData, month: e.target.value })}
                                    >
                                        {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hafta</label>
                                    <select
                                        className="input"
                                        value={requestData.week}
                                        onChange={e => setRequestData({ ...requestData, week: e.target.value })}
                                    >
                                        {/* Generate Mondays for the chosen year */}
                                        {Array.from({ length: 52 }, (_, i) => {
                                            const d = new Date(requestData.year, 0, 1 + (i * 7));
                                            while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const dateStr = `${day}.${month}.${requestData.year}`;
                                            return <option key={i} value={dateStr}>{dateStr}</option>
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Network</label>
                                    <select
                                        className="input"
                                        value={requestData.network}
                                        onChange={e => setRequestData({ ...requestData, network: parseInt(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Network {n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Talep Adeti</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={requestData.quantity}
                                        onChange={e => setRequestData({ ...requestData, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCheckAvailability}
                                disabled={isLoading}
                                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Müsaitlik Kontrol Ediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Müsaitlik Kontrol Et ve Listele
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">Kontrol Sonucu</h4>
                                    <p className="text-xs text-blue-700 mt-1">
                                        {requestData.quantity} adet talep için {results.available.length + results.options.length} uygun yer bulundu.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="card p-3 border-green-200 bg-green-50">
                                    <div className="text-xs text-green-600 font-bold uppercase">Boş Yerler</div>
                                    <div className="text-2xl font-black text-green-700">{results.available.length}</div>
                                    <div className="text-[10px] text-green-500 mt-1">Hemen Rezervasyon yapılabilir</div>
                                </div>
                                <div className="card p-3 border-yellow-200 bg-yellow-50">
                                    <div className="text-xs text-yellow-600 font-bold uppercase">Opsiyonlar</div>
                                    <div className="text-2xl font-black text-yellow-700">{results.options.length}</div>
                                    <div className="text-[10px] text-yellow-500 mt-1">Alt sıra opsiyon olarak atanacak</div>
                                </div>
                                <div className="card p-3 border-red-200 bg-red-50">
                                    <div className="text-xs text-red-600 font-bold uppercase">Dolu</div>
                                    <div className="text-2xl font-black text-red-700">{results.occupied.length}</div>
                                    <div className="text-[10px] text-red-500 mt-1">Bu dönemde kesin kayıtlı</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Atanacak Yer Örnekleri
                                </h3>
                                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="p-2 border-b">Kod</th>
                                                <th className="p-2 border-b">İlçe / Semt</th>
                                                <th className="p-2 border-b">Durum</th>
                                                <th className="p-2 border-b">Eylem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.available.map((loc, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 font-mono font-bold">{loc.kod}</td>
                                                    <td className="p-2">{loc.ilce} / {loc.semt}</td>
                                                    <td className="p-2"><span className="badge badge-success px-1 py-0 text-[10px]">BOŞ</span></td>
                                                    <td className="p-2 font-bold text-green-600">REZERVASYON</td>
                                                </tr>
                                            ))}
                                            {results.options.map((loc, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 font-mono font-bold">{loc.kod}</td>
                                                    <td className="p-2">{loc.ilce} / {loc.semt}</td>
                                                    <td className="p-2"><span className="badge badge-warning px-1 py-0 text-[10px]">OPSİYON</span></td>
                                                    <td className="p-2 font-bold text-yellow-600">OPSİYON {loc.marka2Opsiyon ? '3' : '2'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Filtreleri Düzenle
                                </button>
                                <button
                                    onClick={handleCreateReservations}
                                    disabled={isLoading}
                                    className="flex-[2] btn btn-primary py-2 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Rezervasyon Talebi İlet
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
