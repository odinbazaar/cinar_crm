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

    // Helper function to normalize date formats for comparison
    const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const parts = dateStr.split('T')[0].split('-');
            return `${parts[2]}.${parts[1]}.${parts[0]}`; // Convert to DD.MM.YYYY
        }
        return dateStr;
    };

    // Form states
    const [requestData, setRequestData] = useState({
        brandName: '',
        year: 2026,
        month: 'Ocak',
        week: '05.01.2026',
        network: 1,
        productType: 'BB' as any,
        quantity: 0
    })

    const [networkCounts, setNetworkCounts] = useState<Record<string, Record<string, number>>>({})

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
            { code: 'MGL', name: 'Megalight' },
            { code: 'LB', name: 'LED Ekran' },
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

            // Extract product type from first item
            let productType = 'BB';
            if (firstItem) {
                // Check if type is directly available (from our fixed SalesPage mapping)
                if ((firstItem as any).type && ['BB', 'CLP', 'MGL', 'GB', 'LB', 'MB', 'KB'].includes((firstItem as any).type)) {
                    productType = (firstItem as any).type;
                } else {
                    // Parse from description
                    const desc = firstItem?.description || '';
                    if (desc.includes('Billboard') || desc.includes('BB')) productType = 'BB';
                    else if (desc.includes('CLP') || desc.includes('City Light')) productType = 'CLP';
                    else if (desc.includes('MGL') || desc.includes('Megalight')) productType = 'MGL';
                    else if (desc.includes('GB') || desc.includes('Giant')) productType = 'GB';
                    else if (desc.includes('LB') || desc.includes('Led')) productType = 'LB';
                    else if (desc.includes('MB') || desc.includes('Mini')) productType = 'MB';
                    else if (desc.includes('KB') || desc.includes('Digital')) productType = 'KB';
                }
            }

            // Extract network from first item
            let network: any = 1;
            if ((firstItem as any)?.network) {
                network = (firstItem as any).network;
            } else {
                const desc = firstItem?.description || '';
                const netMatch = desc.match(/Network\s*(\d+|BLD)/i);
                if (netMatch) network = netMatch[1];
            }

            setRequestData({
                brandName: proposal.client?.company_name || proposal.client?.name || '',
                year: initialYear,
                month: initialMonth,
                week: initialWeek,
                network: network,
                productType: productType as any,
                quantity: totalQty
            })
            setStep(1)
        }
    }, [proposal, isOpen])

    // Fetch network counts
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const { inventoryService } = await import('../../services/inventoryService')
                const inventory = await inventoryService.getAll()
                const counts: Record<string, Record<string, number>> = {}
                inventory.forEach(item => {
                    if (item.network) {
                        if (!counts[item.type]) counts[item.type] = {}
                        counts[item.type][item.network] = (counts[item.type][item.network] || 0) + 1
                    }
                })
                setNetworkCounts(counts)
            } catch (err) {
                console.error('Error fetching inventory counts:', err)
            }
        }
        if (isOpen) fetchCounts()
    }, [isOpen])

    // Update quantity based on network and productType
    useEffect(() => {
        const type = requestData.productType
        const net = String(requestData.network)
        if (networkCounts[type] && networkCounts[type][net]) {
            setRequestData(prev => ({ ...prev, quantity: networkCounts[type][net] }))
        } else {
            // If no count found, default to 0 to avoid confusion
            setRequestData(prev => ({ ...prev, quantity: 0 }))
        }
    }, [requestData.network, requestData.productType, networkCounts])

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

    const handleCheckAvailability = async () => {
        setIsLoading(true)

        try {
            const { inventoryService, bookingsService } = await import('../../services');

            // 1. Fetch from Backend
            const [inventory, bookings] = await Promise.all([
                inventoryService.getAll(),
                bookingsService.getAll()
            ]);

            if (inventory && inventory.length > 0) {
                // Filter inventory by static attributes if needed, but results come from JOINING with bookings
                const matchingItems = inventory.filter(item => {
                    const itemNet = String(item.network).toUpperCase();
                    const reqNet = String(requestData.network).toUpperCase();
                    const isNetMatch = itemNet === reqNet ||
                        (itemNet === 'BELEDİYE' && reqNet === 'BLD') ||
                        (itemNet === 'BLD' && reqNet === 'BELEDİYE');

                    return isNetMatch && (item.type === requestData.productType);
                });

                const available: any[] = [];
                const options: any[] = [];
                const occupied: any[] = [];

                matchingItems.forEach(item => {
                    const itemBookings = bookings.filter(b => b.inventory_item_id === item.id && normalizeDate(b.start_date) === requestData.week);
                    const booking = itemBookings[0];

                    // Find next available option slot
                    let nextOptionSlot = 1;
                    if (booking) {
                        if (booking.status === 'KESİN') {
                            // If status is KESİN, slot 1 is taken by the fixed booking provider
                            if (!booking.brand_option_2) nextOptionSlot = 2;
                            else if (!booking.brand_option_3) nextOptionSlot = 3;
                            else if (!booking.brand_option_4) nextOptionSlot = 4;
                            else nextOptionSlot = 5; // All full
                        } else {
                            // If status is OPSİYON, check which slot is next
                            if (!booking.brand_option_1) nextOptionSlot = 1;
                            else if (!booking.brand_option_2) nextOptionSlot = 2;
                            else if (!booking.brand_option_3) nextOptionSlot = 3;
                            else if (!booking.brand_option_4) nextOptionSlot = 4;
                            else nextOptionSlot = 5; // All full
                        }
                    }

                    const uiItem = {
                        id: item.id,
                        kod: item.code,
                        routeNo: item.routeNo,
                        durum: booking?.status || 'BOŞ',
                        nextOptionSlot,
                        marka1Opsiyon: booking?.brand_option_1 || '',
                        marka2Opsiyon: booking?.brand_option_2 || '',
                        marka3Opsiyon: booking?.brand_option_3 || '',
                        marka4Opsiyon: booking?.brand_option_4 || '',
                        ilce: item.district,
                        semt: item.neighborhood,
                        adres: item.address
                    };

                    if (nextOptionSlot === 1 && (!booking || booking.status === 'BOŞ')) {
                        if (available.length < requestData.quantity) available.push(uiItem);
                    } else if (nextOptionSlot <= 4) {
                        if ((available.length + options.length) < requestData.quantity) {
                            options.push(uiItem);
                        }
                    } else {
                        occupied.push(uiItem);
                    }
                });

                setResults({ available, options, occupied });
                setStep(2);
                setIsLoading(false);

                if (matchingItems.length === 0) {
                    info(`Seçilen dönem (${requestData.year} - ${requestData.week}) için henüz envanter oluşturulmamış. "Talebi İşle" dediğinizde otomatik oluşturulacaktır.`)
                } else {
                    info(`${available.length} boş yer, ${options.length} opsiyonel yer bulundu.`)
                }
                return;
            }
        } catch (error) {
            console.warn('Backend check failed, falling back to local data', error);
        }

        // FALLBACK to current inventory from localStorage/reservationsData
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
        }, 800) // Reduced timeout for fallback
    }

    const handleCreateReservations = async () => {
        if (!proposal) return
        setIsLoading(true)

        try {
            const { customerRequestsService } = await import('../../services/customerRequestsService');

            // Prepare the request data for the backend
            // We'll store the extra fields (year, month, week, network, selectedLocations) in product_details or notes as JSON
            const details = {
                brandName: requestData.brandName,
                year: requestData.year,
                month: requestData.month,
                week: requestData.week,
                network: requestData.network,
                availableCount: (results.available || []).length,
                optionsCount: (results.options || []).length,
                selectedLocations: [...(results.available || []), ...(results.options || [])].map(l => ({ id: l.id, kod: l.kod }))
            };

            await customerRequestsService.create({
                request_number: proposal.proposal_number,
                client_id: proposal.client_id,
                product_type: requestData.productType as any,
                product_details: JSON.stringify(details),
                quantity: requestData.quantity,
                start_date: requestData.week.split('.').reverse().join('-'), // Convert DD.MM.YYYY to YYYY-MM-DD
                end_date: requestData.week.split('.').reverse().join('-'), // Placeholder end date
                priority: 'medium',
                notes: `Otomatik talep: ${requestData.brandName}`
            });

            setIsLoading(false)
            success('Rezervasyon talebi başarıyla backend\'e iletildi.')
            if (onComplete) onComplete()
            onClose()
        } catch (err: any) {
            console.error('Error in handleCreateReservations:', err)
            setIsLoading(false)
            error('Talep iletilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
        }
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
                                        <option value={2026}>2026</option>
                                        <option value={2027}>2027</option>
                                        <option value={2028}>2028</option>
                                        <option value={2029}>2029</option>
                                        <option value={2030}>2030</option>
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
                                        onChange={e => setRequestData({ ...requestData, network: e.target.value as any })}
                                    >
                                        {[1, 2, 3, 4, 'BLD'].map(n => <option key={n} value={n}>Network {n}</option>)}
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
                                    <div className="text-xs text-red-600 font-bold uppercase">Tüm Opsiyonlar Dolu</div>
                                    <div className="text-2xl font-black text-red-700">{results.occupied.length}</div>
                                    <div className="text-[10px] text-red-500 mt-1">Bu dönemde yer kalmadı</div>
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
                                                <th className="p-2 border-b">Rout No</th>
                                                <th className="p-2 border-b">İlçe / Semt</th>
                                                <th className="p-2 border-b">Durum</th>
                                                <th className="p-2 border-b">Eylem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.available.map((loc, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 font-mono font-bold">{loc.kod}</td>
                                                    <td className="p-2 font-bold text-primary-600">{loc.routeNo || '-'}</td>
                                                    <td className="p-2">{loc.ilce} / {loc.semt}</td>
                                                    <td className="p-2"><span className="badge badge-success px-1 py-0 text-[10px]">BOŞ</span></td>
                                                    <td className="p-2 font-bold text-green-600">REZERVASYON</td>
                                                </tr>
                                            ))}
                                            {results.options.map((loc, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 font-mono font-bold">{loc.kod}</td>
                                                    <td className="p-2 font-bold text-primary-600">{loc.routeNo || '-'}</td>
                                                    <td className="p-2">{loc.ilce} / {loc.semt}</td>
                                                    <td className="p-2">
                                                        <span className={`badge ${loc.durum === 'KESİN' ? 'badge-error' : 'badge-warning'} px-1 py-0 text-[10px]`}>
                                                            {loc.durum}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 font-bold text-yellow-600">OPSİYON {loc.nextOptionSlot}</td>
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
