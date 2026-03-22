import { useState, useEffect, useMemo } from 'react'
import { X, Search, Check, AlertCircle, Calendar, RefreshCw, Send } from 'lucide-react'
import type { Proposal } from '../../services/proposalsService'
import { reservationsData } from '../../data/reservations'
import { useToast } from '../../hooks/useToast'
import { clientsService, type Client } from '../../services/clientsService'

interface LocationRequestModalProps {
    isOpen: boolean
    onClose: () => void
    proposal?: Proposal | null
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
    const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0)
    const [completedItems, setCompletedItems] = useState<number[]>([])


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
        quantity: 0,
        startDate: '',
        endDate: ''
    })

    const [customers, setCustomers] = useState<{ id: string, name: string }[]>([])
    const [proposalAvailability, setProposalAvailability] = useState<Record<number, { available: number, options: number }>>({})

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
            { code: 'BB', name: 'BILLBOARD' },
            { code: 'CLP', name: 'CLP RAKET' },
            { code: 'MGL', name: 'MEGALIGHT' },
            { code: 'LB', name: 'LED EKRAN' },
            { code: 'GB', name: 'GIANTBOARD' },
            { code: 'KB', name: 'KULEBOARD' },
            { code: 'MB', name: 'MEGABOARD' },
        ]
    })()

    // Sync form with proposal when it changes
    useEffect(() => {
        if (isOpen) {
            if (proposal) {
                setSelectedItemIndex(0)
                setCompletedItems([])
                
                const firstItem = proposal.items && proposal.items.length > 0 ? proposal.items[0] : null;
                const totalQty = proposal.items?.reduce((acc, item) => acc + item.quantity, 0) || 10;

                let initialMonth = 'Ocak';
                let initialYear = 2026;
                let initialWeek = '05.01.2026';

                const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

                const weekInfo = (proposal as any).weekInfo;
                if (weekInfo) {
                    months.forEach(m => {
                        if (weekInfo.includes(m)) initialMonth = m;
                    });

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
                    months.forEach(m => {
                        if (proposal.title?.includes(m)) initialMonth = m;
                    });
                }

                const d = new Date();
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const initialDate = `${d.getFullYear()}-${month}-${day}`;

                let productType = 'BB';
                if (firstItem) {
                    if ((firstItem as any).type && ['BB', 'CLP', 'MGL', 'GB', 'LB', 'MB', 'KB'].includes((firstItem as any).type)) {
                        productType = (firstItem as any).type;
                    } else {
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
                    quantity: totalQty,
                    startDate: (firstItem as any)?.metadata?.startDate || new Date().toISOString().split('T')[0],
                    endDate: (firstItem as any)?.metadata?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })
            } else {
                // If no proposal, just reset to defaults
                setRequestData({
                    brandName: '',
                    year: 2026,
                    month: 'Ocak',
                    week: '05.01.2026',
                    network: 1,
                    productType: 'BB',
                    quantity: 0,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })
            }
            setStep(1)
        }
    }, [proposal?.id, isOpen])

    // Fetch network counts and customers
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch inventory counts
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

                // Fetch customers
                const clients = await clientsService.getAll()
                setCustomers(clients.map(c => ({
                    id: c.id,
                    name: c.company_name || c.name || ''
                })).filter(c => c.name))

                // If proposal, fetch all items' availability
                if (proposal?.items?.length) {
                    fetchProposalAvailabilityAcrossAllItems(inventory)
                }
            } catch (err) {
                console.error('Error fetching data for modal:', err)
            }
        }

        const fetchProposalAvailabilityAcrossAllItems = async (inventory: any[]) => {
            const { bookingsService } = await import('../../services/bookingsService')
            const allBookings = await bookingsService.getAll()
            
            const resultsData: Record<number, { available: number, options: number }> = {}
            
            proposal?.items?.forEach((item: any, idx: number) => {
                let pType = 'BB';
                const desc = item.description || '';
                if (desc.includes('Billboard') || desc.includes('BB')) pType = 'BB';
                else if (desc.includes('CLP')) pType = 'CLP';
                else if (desc.includes('MGL') || desc.includes('Megalight')) pType = 'MGL';
                else if (desc.includes('GB') || desc.includes('Giant')) pType = 'GB';
                else if (desc.includes('LB') || desc.includes('Led')) pType = 'LB';
                else if (desc.includes('MB')) pType = 'MB';
                else if (desc.includes('KB') || desc.includes('Digital')) pType = 'KB';

                let network = '1';
                const netMatch = desc.match(/Network\s*(\d+|BLD)/i);
                if (netMatch) network = netMatch[1];
                else if (item.network) network = String(item.network);

                const targetWeek = normalizeDate(new Date().toISOString()); // Default to current week logic if not set

                const matching = inventory.filter(inv => inv.type === pType && String(inv.network) === network);
                const periodBookings = allBookings.filter(b => normalizeDate(b.start_date) === targetWeek);

                let available = 0;
                let options = 0;

                matching.forEach(inv => {
                    const booking = periodBookings.find(b => b.inventory_item_id === inv.id);
                    if (!booking || booking.status === 'BOŞ') available++;
                    else if (booking.status === 'OPSİYON') {
                        if (!booking.brand_option_2 || !booking.brand_option_3 || !booking.brand_option_4) options++;
                    }
                });

                resultsData[idx] = { available, options };
            });

            setProposalAvailability(resultsData);
        }

        if (isOpen) fetchData()
    }, [isOpen, proposal?.id])

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

    // Generate weeks based on year and month
    const weekOptions = useMemo(() => {
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const generatedWeeks: { value: string; label: string; month: string }[] = []
        const startOfYear = new Date(requestData.year, 0, 1)

        // Find first Monday
        let curr = new Date(startOfYear)
        while (curr.getDay() !== 1) {
            curr.setDate(curr.getDate() + 1)
        }

        // Iterate through year
        while (curr.getFullYear() <= requestData.year) {
            const day = String(curr.getDate()).padStart(2, '0')
            const monthNum = String(curr.getMonth() + 1).padStart(2, '0')
            const dateStr = `${day}.${monthNum}.${curr.getFullYear()}`
            const weekMonthName = months[curr.getMonth()];

            generatedWeeks.push({ value: dateStr, label: dateStr, month: weekMonthName })
            curr.setDate(curr.getDate() + 7)
        }

        return generatedWeeks.filter(w => w.month === requestData.month);
    }, [requestData.year, requestData.month]);

    // Update selected week when month change makes current week invalid
    useEffect(() => {
        if (weekOptions.length > 0) {
            const isWeekInMonth = weekOptions.some(w => w.value === requestData.week);
            if (!isWeekInMonth) {
                setRequestData(prev => ({ ...prev, week: weekOptions[0].value }));
            }
        }
    }, [requestData.month, weekOptions]);

    const [results, setResults] = useState<{
        available: any[]
        options: any[]
        occupied: any[]
    }>({ available: [], options: [], occupied: [] })

    if (!isOpen) return null

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
                    return item.type === requestData.productType;
                });

                const available: any[] = [];
                const options: any[] = [];
                const occupied: any[] = [];

                matchingItems.forEach(item => {
                    const targetDate = normalizeDate(requestData.startDate);

                    const itemBookings = bookings.filter(b => b.inventory_item_id === item.id && normalizeDate(b.start_date) === targetDate);
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
                        available.push(uiItem);
                    } else if (nextOptionSlot <= 4) {
                        options.push(uiItem);
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

            const targetDate = normalizeDate(requestData.startDate);

            const matching = allLocations.filter(loc =>
                loc.hafta === targetDate &&
                loc.productType === requestData.productType
            )

            const available = matching.filter(l => l.durum === 'BOŞ')
            
            const options = matching.filter(l =>
                l.durum === 'OPSİYON' &&
                (!l.marka2Opsiyon || !l.marka3Opsiyon || !l.marka4Opsiyon)
            )

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
                startDate: requestData.startDate,
                endDate: requestData.endDate,
                availableCount: (results.available || []).length,
                optionsCount: (results.options || []).length,
                selectedLocations: [...(results.available || []), ...(results.options || [])].map(l => ({ id: l.id, kod: l.kod })),
                proposalItems: proposal?.items?.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total: item.total || (item.quantity * item.unit_price),
                    type: (item as any).metadata?.type || (item as any).type,
                    network: (item as any).network || (item as any).metadata?.network,
                    printingCost: (item as any).metadata?.printingCost || (item as any).metadata?.printing_cost || 0,
                    operationCost: (item as any).metadata?.operationCost || (item as any).metadata?.operation_cost || 0,
                    discountedPrice: (item as any).metadata?.discountedPrice || (item as any).metadata?.discounted_price || 0
                })) || [],
                proposalNumber: proposal?.proposal_number || '',
                proposalTotal: proposal?.total || proposal?.subtotal || 0
            };

            await customerRequestsService.create({
                request_number: proposal?.proposal_number || 'GENEL-' + Date.now(),
                client_id: proposal?.client_id || '',
                product_type: requestData.productType as any,
                product_details: JSON.stringify(details),
                quantity: requestData.quantity,
                start_date: requestData.startDate,
                end_date: requestData.endDate,
                priority: 'medium',
                notes: JSON.stringify({
                    type: 'auto_request',
                    proposal_id: proposal?.id || null,
                    brandName: requestData.brandName,
                    createdAt: new Date().toISOString()
                })
            });

            setIsLoading(false)
            success('Rezervasyon talebi başarıyla backend\'e iletildi.')
            
            const newCompletedItems = [...completedItems, selectedItemIndex];
            setCompletedItems(newCompletedItems)

            // Eğer teklif yoksa veya TÜM kalemler bittiyse modalı kapat
            if (!proposal || newCompletedItems.length >= (proposal.items?.length || 0)) {
                onClose();
                setStep(1);
            } else {
                setStep(1);
            }

            if (onComplete) onComplete()
        } catch (err: any) {
            console.error('Error in handleCreateReservations:', err)
            setIsLoading(false)
            error('Talep iletilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
        }
    }

    const handleSendResultsToSales = async () => {
        setIsLoading(true)
        try {
            const { customerRequestsService } = await import('../../services/customerRequestsService');

            const currentResults = {
                available: results.available.map(l => ({ id: l.id, kod: l.kod })),
                options: results.options.map(l => ({ id: l.id, kod: l.kod }))
            };

            const details = {
                brandName: requestData.brandName,
                year: requestData.year,
                month: requestData.month,
                week: requestData.week,
                network: requestData.network,
                startDate: requestData.startDate,
                endDate: requestData.endDate,
                availableCount: currentResults.available.length,
                optionsCount: currentResults.options.length,
                selectedLocations: [...currentResults.available, ...currentResults.options],
                proposalItems: proposal?.items?.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total: item.total || (item.quantity * item.unit_price),
                    type: (item as any).metadata?.type || (item as any).type,
                    network: (item as any).network || (item as any).metadata?.network,
                    printingCost: (item as any).metadata?.printingCost || (item as any).metadata?.printing_cost || 0,
                    operationCost: (item as any).metadata?.operationCost || (item as any).metadata?.operation_cost || 0,
                    discountedPrice: (item as any).metadata?.discountedPrice || (item as any).metadata?.discounted_price || 0
                })) || [],
                proposalNumber: proposal?.proposal_number || '',
                proposalTotal: proposal?.total || proposal?.subtotal || 0
            };

            await customerRequestsService.create({
                request_number: proposal?.proposal_number || 'GENEL-' + Date.now(),
                client_id: proposal?.client_id || '',
                product_type: requestData.productType as any,
                product_details: JSON.stringify(details),
                quantity: requestData.quantity,
                start_date: requestData.startDate,
                end_date: requestData.endDate,
                priority: 'medium',
                status: 'checked_by_ops' as any,
                notes: JSON.stringify({
                    type: 'ops_check_result',
                    proposal_id: proposal?.id || null,
                    results: currentResults,
                    checkedAt: new Date().toISOString()
                })
            });

            setIsLoading(false)
            success('Müsaitlik sonuçları satış birimine iletildi.')
            
            const newCompletedItems = [...completedItems, selectedItemIndex];
            setCompletedItems(newCompletedItems)
            
            // Eğer teklif yoksa veya TÜM kalemler bittiyse modalı kapat
            if (!proposal || newCompletedItems.length >= (proposal.items?.length || 0)) {
                onClose();
                setStep(1);
            } else {
                setStep(1);
            }
            
            if (onComplete) onComplete()
        } catch (err: any) {
            console.error('Error in handleSendResultsToSales:', err)
            setIsLoading(false)
            error('Sonuçlar iletilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Yer Listesi Talebi Oluştur</h2>
                        {proposal && <p className="text-sm text-gray-500">{proposal.proposal_number} - {proposal.title}</p>}
                        {!proposal && <p className="text-sm text-gray-500">Genel Müsaitlik Sorgulama</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* Proposal Items List */}
                            {proposal && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-primary-500" />
                                        Teklif Edilen Ürünler (Hızlı Seçim)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {proposal.items?.filter(item => !item.description.includes('OP.') && !item.description.includes('BASKI')).map((item, idx) => {
                                            let cleanDesc = item.description;
                                            let periodInfo = '';
                                            
                                            if (item.description.includes('[DÖNEM:')) {
                                                const periodMatch = item.description.match(/\[DÖNEM: (.*?)\]/);
                                                if (periodMatch) periodInfo = periodMatch[1];
                                                cleanDesc = cleanDesc.replace(/\[DÖNEM: .*?\]/, '').trim();
                                            }
                                            
                                            if (cleanDesc.includes('[BAŞLANGIÇ:')) {
                                                cleanDesc = cleanDesc.replace(/\[BAŞLANGIÇ: .*?\]/, '').trim();
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedItemIndex(idx)
                                                        
                                                        // Robustly identify the product type code
                                                        let ptCode = (item as any).metadata?.type;
                                                        if (!ptCode) {
                                                            const foundType = productTypes.find((pt: any) =>
                                                                item.description.toUpperCase().includes(pt.name.toUpperCase()) ||
                                                                item.description.toUpperCase().includes(pt.code.toUpperCase())
                                                            );
                                                            ptCode = foundType?.code;
                                                        }
                                                        
                                                        setRequestData(prev => ({
                                                            ...prev,
                                                            productType: ptCode || 'BB',
                                                            quantity: item.quantity,
                                                            network: (item as any).network || prev.network,
                                                            startDate: (item as any).metadata?.startDate || prev.startDate,
                                                            endDate: (item as any).metadata?.endDate || prev.endDate
                                                        }));
                                                    }}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${selectedItemIndex === idx
                                                        ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                                                        : 'bg-white border-gray-200 hover:border-primary-300'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{cleanDesc} {periodInfo ? `(${periodInfo})` : ''}</div>
                                                        <div className="text-xs text-gray-500">Adet: {item.quantity} {(item as any).network ? `| Network: ${(item as any).network}` : ''}</div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className={`${completedItems.includes(idx) ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'} text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1`}>
                                                            {completedItems.includes(idx) ? (
                                                                <>
                                                                    <Check className="w-3 h-3" />
                                                                    TAMAM
                                                                </>
                                                            ) : 'SEÇ'}
                                                        </div>
                                                        {proposalAvailability[idx] && (
                                                            <div className="flex gap-1">
                                                                <span className="text-[9px] bg-green-50 text-green-600 px-1 rounded border border-green-100">
                                                                    {proposalAvailability[idx].available} Boş
                                                                </span>
                                                                <span className="text-[9px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100">
                                                                    {proposalAvailability[idx].options} Ops
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Marka Adı</label>
                                    <input
                                        list="customer-brands"
                                        type="text"
                                        className="input"
                                        value={requestData.brandName}
                                        onChange={e => setRequestData({ ...requestData, brandName: e.target.value })}
                                        placeholder="Marka seçin veya yazın..."
                                    />
                                    <datalist id="customer-brands">
                                        {customers.map(c => (
                                            <option key={c.id} value={c.name} />
                                        ))}
                                    </datalist>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={requestData.startDate}
                                        onChange={e => setRequestData({ ...requestData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={requestData.endDate}
                                        onChange={e => setRequestData({ ...requestData, endDate: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
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
                                            {[...results.available, ...results.options, ...results.occupied].map((loc, i) => (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="p-2 font-mono font-bold">{loc.kod}</td>
                                                    <td className="p-2 font-bold text-primary-600">{loc.routeNo || '-'}</td>
                                                    <td className="p-2">{loc.ilce} / {loc.semt}</td>
                                                    <td className="p-2">
                                                        <span className={`badge ${
                                                            loc.durum === 'BOŞ' ? 'badge-success' : 
                                                            loc.durum === 'KESİN' ? 'badge-error' : 'badge-warning'
                                                        } px-1 py-0 text-[10px]`}>
                                                            {loc.durum}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 font-bold whitespace-nowrap">
                                                        {loc.durum === 'BOŞ' ? (
                                                            <span className="text-green-600">REZERVASYON</span>
                                                        ) : loc.nextOptionSlot <= 4 ? (
                                                            <span className="text-yellow-600">OPSİYON {loc.nextOptionSlot}</span>
                                                        ) : (
                                                            <span className="text-red-500 text-[10px]">TÜM SIRALAR DOLU</span>
                                                        )}
                                                    </td>
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
                                    onClick={handleSendResultsToSales}
                                    disabled={isLoading}
                                    className="flex-1 btn bg-indigo-600 hover:bg-indigo-700 text-white py-2 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Satışa Onaya Gönder
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleCreateReservations}
                                    disabled={isLoading}
                                    className="flex-1 btn btn-primary py-2 flex items-center justify-center gap-2"
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
