import { useState, useMemo, useEffect } from 'react'
import { FileSpreadsheet, MapPin, Search, Filter, Calendar, Clock, Check, X, CheckCircle, Smartphone, RefreshCw, ChevronRight, ChevronLeft, Download, Plus, Trash2, AlertCircle, CalendarDays, Send } from 'lucide-react'
import { reservationsData } from '../data/reservations'
import { useToast } from '../hooks/useToast'
import { inventoryService, bookingsService, customerRequestsService } from '../services'

// Lokasyon tipi
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
    routeNo?: string
    network: number
    marka1Opsiyon: string
    marka2Opsiyon: string
    marka3Opsiyon: string
    marka4Opsiyon: string
    durum: 'OPSİYON' | 'KESİN' | 'BOŞ'
    productType: 'BB' | 'CLP' | 'ML' | 'LED' | 'GB' | 'MB' | 'KB'
}

// Verileri tip güvenli hale getirelim ve başlangıçta temizleyelim
const typedReservations = (reservationsData as any[]).map(loc => ({
    ...loc,
    marka1Opsiyon: '',
    marka2Opsiyon: '',
    marka3Opsiyon: '',
    marka4Opsiyon: '',
    durum: 'BOŞ'
})) as Location[]


const sampleLocations: Location[] = typedReservations




export default function ReservationsPage() {
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedYear, setSelectedYear] = useState<number>(2026)
    const [selectedMonth, setSelectedMonth] = useState<string>('Ocak')
    const [selectedWeek, setSelectedWeek] = useState('05.01.2026')
    const [selectedNetwork, setSelectedNetwork] = useState<any>(1)
    const [selectedDistrict, setSelectedDistrict] = useState<string>('Tümü')
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Tümü')
    const [selectedProductType, setSelectedProductType] = useState<string>('Tümü')

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [brandName, setBrandName] = useState('')
    const [selectedOpsiyonNumber, setSelectedOpsiyonNumber] = useState<1 | 2 | 3 | 4>(1)
    const [isAutoAssigning, setIsAutoAssigning] = useState(false)
    const [showReviseModal, setShowReviseModal] = useState(false)
    const [reviseSlot, setReviseSlot] = useState<1 | 2 | 3 | 4>(1)
    const [reviseTargetId, setReviseTargetId] = useState('')

    // Sabit Seçenekler
    const allMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const yearOptions = [2026, 2027, 2028, 2029, 2030]
    const networkOptions = [1, 2, 3, 4, 5, 6, 7, 8]
    const productTypes = ['Tümü', 'BB', 'CLP', 'ML', 'LED', 'GB', 'MB', 'KB']

    // Dinamik Filtre Seçenekleri
    const monthOptions = allMonths

    const weekOptions = useMemo(() => {
        // Envanterdeki mevcut haftaları al
        const existingWeeks = Array.from(new Set(locations.map(l => l.hafta)))

        // Seçilen yılın tüm Pazartesi günlerini üret (52 veya 53 hafta)
        const generatedWeeks: string[] = []
        const startOfYear = new Date(selectedYear, 0, 1)

        // Yılın ilk Pazartesi'sini bul
        let curr = new Date(startOfYear)
        while (curr.getDay() !== 1) {
            curr.setDate(curr.getDate() + 1)
        }

        // Yıl bitene kadar haftalık ilerle
        while (curr.getFullYear() <= selectedYear) {
            const day = String(curr.getDate()).padStart(2, '0')
            const month = String(curr.getMonth() + 1).padStart(2, '0')
            const dateStr = `${day}.${month}.${curr.getFullYear()}`
            generatedWeeks.push(dateStr)
            curr.setDate(curr.getDate() + 7)
        }

        const combined = Array.from(new Set([...existingWeeks, ...generatedWeeks])).sort((a, b) => {
            const [d1, m1, y1] = a.split('.').map(Number)
            const [d2, m2, y2] = b.split('.').map(Number)
            return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()
        })

        return combined.map(w => ({ value: w, label: w }))
    }, [locations, selectedYear])

    const districtOptions = useMemo(() => ['Tümü', ...Array.from(new Set(locations.map(l => l.ilce)))], [locations])
    const neighborhoodOptions = useMemo(() => ['Tümü', ...Array.from(new Set(locations.map(l => l.semt)))], [locations])

    const [activeTab, setActiveTab] = useState<'list' | 'requests'>('list')
    const [reservationRequests, setReservationRequests] = useState<any[]>([])
    const [isLoadingRequests, setIsLoadingRequests] = useState(false)
    const [isLoadingLocations, setIsLoadingLocations] = useState(false)

    const { success: toastSuccess, info: toastInfo } = useToast()

    const fetchData = async () => {
        setIsLoadingRequests(true);
        setIsLoadingLocations(true);
        try {
            // 1. Fetch Customer Requests
            const requests = await customerRequestsService.getAll();
            const mappedRequests = requests.map((req: any) => {
                let details: any = {};
                try {
                    details = req.product_details ? JSON.parse(req.product_details) : {};
                } catch (e) { console.error('Error parsing details:', e); }

                return {
                    id: req.id,
                    customerName: req.client?.company_name || 'Bilinmeyen',
                    brandName: details.brandName || 'Bilinmeyen',
                    productType: req.product_type,
                    year: details.year || 2026,
                    month: details.month || 'Ocak',
                    week: details.week || req.start_date,
                    network: details.network || '1',
                    availableCount: details.availableCount || 0,
                    optionsCount: details.optionsCount || 0,
                    status: req.status === 'completed' ? 'completed' : 'pending',
                    createdAt: req.created_at,
                    selectedLocations: details.selectedLocations || []
                };
            });
            setReservationRequests(mappedRequests);

            // 2. Fetch Inventory and Bookings
            const [inventory, bookings] = await Promise.all([
                inventoryService.getAll(),
                bookingsService.getAll()
            ]);

            // Helper function to normalize date formats for comparison
            const normalizeDate = (dateStr: string): string => {
                if (!dateStr) return '';
                // Handle ISO format: 2026-01-05 or 2026-01-05T00:00:00
                if (dateStr.includes('-')) {
                    const parts = dateStr.split('T')[0].split('-');
                    return `${parts[2]}.${parts[1]}.${parts[0]}`; // Convert to DD.MM.YYYY
                }
                return dateStr; // Already in DD.MM.YYYY format
            };

            // Combine inventory with bookings to create UI locations
            const currentLocations = inventory.map((item: any) => {
                // Compare normalized dates
                const itemBookings = bookings.filter(b =>
                    b.inventory_item_id === item.id &&
                    normalizeDate(b.start_date) === selectedWeek
                );
                const booking = itemBookings[0];

                return {
                    id: item.id,
                    yil: selectedYear,
                    ay: selectedMonth,
                    hafta: selectedWeek,
                    koordinat: item.coordinates || '',
                    ilce: item.district,
                    semt: item.neighborhood || '',
                    adres: item.address,
                    kod: item.code,
                    routeNo: item.routeNo,
                    network: Number(item.network) || 1,
                    marka1Opsiyon: booking?.brand_option_1 || '',
                    marka2Opsiyon: booking?.brand_option_2 || '',
                    marka3Opsiyon: booking?.brand_option_3 || '',
                    marka4Opsiyon: booking?.brand_option_4 || '',
                    durum: (booking?.status as any) || 'BOŞ',
                    productType: (item.type === 'Billboard' ? 'BB' : item.type) as any
                };
            });

            // Always update state with fresh backend data
            setLocations(currentLocations);

            // Update localStorage only on success to keep it somewhat in sync for offline, 
            // but we primary believe the backend
            localStorage.setItem('inventoryLocations', JSON.stringify(currentLocations));

        } catch (error) {
            console.error('Error fetching data:', error);
            // On error, we can try to use localStorage as a fallback
            const savedReq = localStorage.getItem('reservationRequests');
            if (savedReq) setReservationRequests(JSON.parse(savedReq));

            const savedLoc = localStorage.getItem('inventoryLocations');
            if (savedLoc) setLocations(JSON.parse(savedLoc));
        } finally {
            setIsLoadingRequests(false);
            setIsLoadingLocations(false);
        }
    };

    const handleMigrateInventory = async () => {
        setIsLoadingLocations(true);
        try {
            const uniqueMap = new Map();
            reservationsData.forEach((item: any) => {
                if (!uniqueMap.has(item.kod)) {
                    uniqueMap.set(item.kod, {
                        code: item.kod,
                        type: item.productType === 'BB' ? 'Billboard' : item.productType,
                        district: item.ilce,
                        neighborhood: item.semt,
                        address: item.adres,
                        coordinates: item.koordinat,
                        network: String(item.network),
                        is_active: true
                    });
                }
            });

            const uniqueItems = Array.from(uniqueMap.values());
            toastSuccess(`${uniqueItems.length} lokasyon tespit edildi. Aktarım başlıyor...`);

            let successCount = 0;
            for (const item of uniqueItems) {
                try {
                    await inventoryService.create(item);
                    successCount++;
                } catch (e) { console.error('Failed to create item', item.code, e); }
            }

            toastSuccess(`${successCount} lokasyon başarıyla Supabase'e aktarıldı.`);
            fetchData();
        } catch (e) {
            console.error('Migration error', e);
            toastInfo('Aktarım sırasında hata oluştu.');
        } finally {
            setIsLoadingLocations(false);
        }
    };

    useEffect(() => {
        // Clear localStorage to force fresh data from backend
        localStorage.removeItem('inventoryLocations');
        localStorage.removeItem('reservationRequests');
        fetchData();
        // Set up periodic refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Also keep the storage sync for legacy compatibility
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'reservationRequests' || e.key === 'inventoryLocations') {
                fetchData();
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, []);

    const handleProcessRequest = async (request: any) => {
        let currentLocations = [...locations];

        // 1. Check if we need to seed the year/week for the requested inventory
        const periodExists = currentLocations.some(l =>
            l.yil === request.year &&
            l.hafta === request.week &&
            String(l.network) === String(request.network)
        );

        let seededCount = 0;
        if (!periodExists) {
            const hasDataForWeek = reservationsData.some((l: any) => l.hafta === request.week);

            if (hasDataForWeek) {
                const clones = reservationsData
                    .filter((l: any) => l.hafta === request.week)
                    .map((l: any) => ({
                        ...l,
                        id: `clone-${l.id}-${Date.now()}`,
                        yil: request.year,
                        marka1Opsiyon: '',
                        marka2Opsiyon: '',
                        marka3Opsiyon: '',
                        marka4Opsiyon: ''
                    }));
                currentLocations = [...currentLocations, ...clones];
                seededCount = clones.length;
            }
        }

        // 2. Identify locations to update
        let updatedCount = 0;
        const targetIds = (request.selectedLocations || []).map((sl: any) => sl.id);
        const brandUpper = request.brandName.toUpperCase();

        const updatedLocations = currentLocations.map(loc => {
            const isIdMatch = targetIds.includes(loc.id);
            const isMetaMatch = !targetIds.length &&
                updatedCount < request.quantity &&
                loc.yil === request.year &&
                loc.hafta === request.week &&
                String(loc.network) === String(request.network) &&
                loc.productType === request.productType &&
                (loc.durum === 'BOŞ' || (loc.durum === 'OPSİYON' && (!loc.marka1Opsiyon || !loc.marka2Opsiyon || !loc.marka3Opsiyon || !loc.marka4Opsiyon)));

            if (isIdMatch || isMetaMatch) {
                const newLoc = { ...loc };
                if (newLoc.durum === 'BOŞ') {
                    newLoc.durum = 'OPSİYON';
                    newLoc.marka1Opsiyon = brandUpper;
                    if (isMetaMatch) updatedCount++;
                    return newLoc;
                } else if (newLoc.durum === 'OPSİYON') {
                    if (!newLoc.marka1Opsiyon) newLoc.marka1Opsiyon = brandUpper;
                    else if (!newLoc.marka2Opsiyon) newLoc.marka2Opsiyon = brandUpper;
                    else if (!newLoc.marka3Opsiyon) newLoc.marka3Opsiyon = brandUpper;
                    else if (!newLoc.marka4Opsiyon) newLoc.marka4Opsiyon = brandUpper;
                    newLoc.durum = 'OPSİYON';
                    if (isMetaMatch) updatedCount++;
                    return newLoc;
                }
            }
            return loc;
        });

        setLocations(updatedLocations);

        // Update request status in BACKEND
        try {
            // Create Bookings in Supabase
            const modifiedLocs = updatedLocations.filter(loc => {
                const oldLoc = locations.find(ol => ol.id === loc.id);
                return JSON.stringify(oldLoc) !== JSON.stringify(loc);
            });

            for (const loc of modifiedLocs) {
                // Check if this is a real Supabase inventory item (UUID)
                if (loc.id.length > 20) {
                    await bookingsService.create({
                        inventory_item_id: loc.id,
                        brand_name: request.brandName,
                        network: String(request.network),
                        start_date: request.week,
                        end_date: request.week,
                        status: loc.durum,
                        brand_option_1: loc.marka1Opsiyon,
                        brand_option_2: loc.marka2Opsiyon,
                        brand_option_3: loc.marka3Opsiyon,
                        brand_option_4: loc.marka4Opsiyon
                    });
                }
            }

            await customerRequestsService.update(request.id, { status: 'completed' });
            fetchData(); // Refresh list from backend
        } catch (error) {
            console.error('Error updating request status:', error);
            const updatedRequests = reservationRequests.map(r =>
                r.id === request.id ? { ...r, status: 'completed' } : r
            );
            setReservationRequests(updatedRequests);
        }

        // Save inventory to localStorage for persistence (until inventory is fully moved to backend)
        try {
            localStorage.setItem('inventoryLocations', JSON.stringify(updatedLocations));
        } catch (e) {
            console.warn('Storage limit reached, changes will only be in memory.');
        }

        setSelectedYear(request.year);
        // Map month name if needed, assuming they match
        setSelectedMonth(request.month);
        setSelectedWeek(request.week);
        setSelectedNetwork(Number(request.network) || request.network);
        setActiveTab('list');

        const totalAssigned = targetIds.length || updatedCount;
        let message = `${request.customerName} - ${request.brandName} talebi işlendi.\n\n`;
        if (seededCount > 0) message += `✅ ${seededCount} yeni lokasyon envantere eklendi.\n`;
        message += `📍 ${totalAssigned} lokasyona marka ataması yapıldı.\n`;
        message += `📅 Dönem: ${request.year} - ${request.week}`;

        toastSuccess(message);
    }

    const handleResetData = async () => {
        if (window.confirm('Tüm rezervasyon verilerini sıfırlayıp fabrika ayarlarına dönmek istediğinize emin misiniz? (Tüm atanmış markalar silinecektir)')) {
            try {
                // Backend cleanup
                const bookings = await bookingsService.getAll();
                for (const b of bookings) {
                    await bookingsService.delete(b.id);
                }

                localStorage.removeItem('inventoryLocations')
                localStorage.removeItem('reservationRequests')
                toastSuccess('Sistem verileri başarıyla sıfırlandı.');
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error('Reset error:', error);
                toastInfo('Sıfırlama sırasında bazı hatalar oluştu.');
            }
        }
    }

    // Filtreleme
    const filteredLocations = locations.filter(loc =>
        loc.yil === selectedYear &&
        loc.ay === selectedMonth &&
        loc.hafta === selectedWeek &&
        loc.network === selectedNetwork &&
        (selectedDistrict === 'Tümü' || loc.ilce === selectedDistrict) &&
        (selectedNeighborhood === 'Tümü' || loc.semt === selectedNeighborhood) &&
        (selectedProductType === 'Tümü' || loc.productType === selectedProductType) &&
        (searchTerm === '' ||
            loc.adres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.kod.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.semt.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Tümünü seç
    const handleSelectAll = () => {
        if (selectedRows.length === filteredLocations.length) {
            setSelectedRows([])
        } else {
            setSelectedRows(filteredLocations.map(loc => loc.id))
        }
    }

    // Tek satır seç
    const handleSelectRow = (id: string) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(r => r !== id))
        } else {
            setSelectedRows([...selectedRows, id])
        }
    }

    // Otomatik atama (Macro benzeri)
    const handleAutoAssign = async () => {
        if (!brandName.trim()) {
            alert('Lütfen marka adı girin!')
            return
        }

        setIsAutoAssigning(true)
        const brandUpper = brandName.toUpperCase()

        try {
            // Get all existing bookings once for efficiency
            const existingBookings = await bookingsService.getAll();

            const updated = await Promise.all(locations.map(async (loc) => {
                if (selectedRows.includes(loc.id)) {
                    const newLoc = { ...loc }
                    if (selectedOpsiyonNumber === 1) newLoc.marka1Opsiyon = brandUpper
                    else if (selectedOpsiyonNumber === 2) newLoc.marka2Opsiyon = brandUpper
                    else if (selectedOpsiyonNumber === 3) newLoc.marka3Opsiyon = brandUpper
                    else if (selectedOpsiyonNumber === 4) newLoc.marka4Opsiyon = brandUpper

                    if (newLoc.durum === 'BOŞ') newLoc.durum = 'OPSİYON'

                    // Always save to database
                    const existing = existingBookings.find(b => b.inventory_item_id === loc.id && b.start_date === selectedWeek);

                    const bookingData = {
                        inventory_item_id: loc.id,
                        brand_option_1: newLoc.marka1Opsiyon,
                        brand_option_2: newLoc.marka2Opsiyon,
                        brand_option_3: newLoc.marka3Opsiyon,
                        brand_option_4: newLoc.marka4Opsiyon,
                        start_date: selectedWeek,
                        end_date: selectedWeek,
                        status: newLoc.durum,
                        network: String(selectedNetwork)
                    };

                    if (existing) {
                        await bookingsService.update(existing.id, bookingData);
                    } else {
                        await bookingsService.create(bookingData);
                    }
                    return newLoc
                }
                return loc
            }));

            setLocations(updated as any)
            localStorage.setItem('inventoryLocations', JSON.stringify(updated))
            toastSuccess(`${selectedRows.length} adet lokasyona ${brandUpper} markası atandı!`)
        } catch (error) {
            console.error('Auto assign error:', error);
            toastInfo('Bazı kayıtlar güncellenemedi.');
        } finally {
            setIsAutoAssigning(false)
            setShowAssignModal(false)
            setSelectedRows([])
            setBrandName('')
        }
    }

    // Durumu değiştir
    const handleStatusChange = (id: string, newStatus: 'OPSİYON' | 'KESİN' | 'BOŞ') => {
        const updated = locations.map(loc => {
            if (loc.id === id) {
                return { ...loc, durum: newStatus }
            }
            return loc
        })
        setLocations(updated)
        localStorage.setItem('inventoryLocations', JSON.stringify(updated))
    }

    // Seçili rezervasyonları sil
    const handleDeleteSelected = async () => {
        if (selectedRows.length === 0) {
            toastInfo('Lütfen silmek istediğiniz satırları seçin.');
            return;
        }

        const confirmMessage = `${selectedRows.length} adet lokasyonun marka atamasını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            // Backend'den rezervasyonları sil
            for (const locId of selectedRows) {
                if (locId.length > 20) { // UUID check
                    const existingBookings = await bookingsService.getAll();
                    const toDelete = existingBookings.filter(b => b.inventory_item_id === locId);
                    for (const booking of toDelete) {
                        await bookingsService.delete(booking.id);
                    }
                }
            }

            // UI'da marka bilgilerini temizle
            const updated = locations.map(loc => {
                if (selectedRows.includes(loc.id)) {
                    return {
                        ...loc,
                        marka1Opsiyon: '',
                        marka2Opsiyon: '',
                        marka3Opsiyon: '',
                        marka4Opsiyon: '',
                        durum: 'BOŞ' as const
                    };
                }
                return loc;
            });

            setLocations(updated);
            setSelectedRows([]);
            toastSuccess(`${selectedRows.length} adet lokasyonun marka ataması başarıyla silindi.`);
        } catch (error) {
            console.error('Delete error:', error);
            toastInfo('Silme işlemi sırasında bir hata oluştu.');
        }
    }

    // Excel export
    const handleExportExcel = () => {
        const csvContent = [
            ['Yıl', 'Ay', 'Hafta', 'Koordinat', 'İlçe', 'Semt', 'Adres', 'Kod', 'Rout No', 'Network', 'Marka 1.Opsiyon', 'Marka 2.Opsiyon', 'Marka 3.Opsiyon', 'Marka 4.Opsiyon', 'Durum'].join('\t'),
            ...filteredLocations.map(loc =>
                [loc.yil, loc.ay, loc.hafta, loc.koordinat, loc.ilce, loc.semt, loc.adres, loc.kod, loc.routeNo || '-', loc.network, loc.marka1Opsiyon, loc.marka2Opsiyon, loc.marka3Opsiyon, loc.marka4Opsiyon, loc.durum].join('\t')
            )
        ].join('\n')

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `rezervasyon_${selectedWeek.replace(/\./g, '_')}_network${selectedNetwork}.csv`
        link.click()
    }

    // Mail gönder
    const handleSendEmail = () => {
        const selectedCount = selectedRows.length > 0 ? selectedRows.length : filteredLocations.length
        alert(`${selectedCount} adet lokasyon bilgisi satış temsilcisine mail olarak gönderildi!\n\nAlıcı: satis @izmiracikhavareklam.com`)
    }

    // Opsiyonu Kesine çevir
    const handleConfirmSelected = async () => {
        if (selectedRows.length === 0) return;

        try {
            // Get all existing bookings once
            const existingBookings = await bookingsService.getAll();

            const updated = await Promise.all(locations.map(async (loc) => {
                if (selectedRows.includes(loc.id)) {
                    const newLoc = { ...loc, durum: 'KESİN' as const };

                    // Find existing booking for this location and week
                    const existing = existingBookings.find(
                        b => b.inventory_item_id === loc.id && b.start_date === selectedWeek
                    );

                    if (existing) {
                        // Update existing booking to KESİN status
                        await bookingsService.update(existing.id, {
                            status: 'KESİN',
                            brand_option_1: loc.marka1Opsiyon || existing.brand_option_1,
                            brand_option_2: loc.marka2Opsiyon || existing.brand_option_2,
                            brand_option_3: loc.marka3Opsiyon || existing.brand_option_3,
                            brand_option_4: loc.marka4Opsiyon || existing.brand_option_4,
                        });
                    } else {
                        // Create new booking with KESİN status
                        await bookingsService.create({
                            inventory_item_id: loc.id,
                            start_date: selectedWeek,
                            end_date: selectedWeek,
                            status: 'KESİN',
                            network: String(selectedNetwork),
                            brand_option_1: loc.marka1Opsiyon || '',
                            brand_option_2: loc.marka2Opsiyon || '',
                            brand_option_3: loc.marka3Opsiyon || '',
                            brand_option_4: loc.marka4Opsiyon || '',
                        });
                    }
                    return newLoc;
                }
                return loc;
            }));

            setLocations(updated as any);
            localStorage.setItem('inventoryLocations', JSON.stringify(updated));
            setSelectedRows([]);
            toastSuccess(`${selectedRows.length} adet opsiyon KESİN olarak onaylandı ve Asım Listesi'ne eklendi!`);
        } catch (error) {
            console.error('Confirm error:', error);
            toastInfo('Onaylama sırasında bir hata oluştu.');
        }
    }

    const handleSaveRevision = async () => {
        const sourceId = selectedRows[0];
        const sourceLoc = locations.find(l => l.id === sourceId);
        const targetLoc = locations.find(l => l.id === reviseTargetId);

        if (!sourceLoc || !targetLoc) {
            alert('Lütfen bir hedef lokasyon seçin!');
            return;
        }

        const brandToMove = sourceLoc[`marka${reviseSlot}Opsiyon` as keyof Location];
        if (!brandToMove) {
            alert('Seçilen opsiyon alanında marka bulunmuyor!');
            return;
        }

        try {
            const updated = await Promise.all(locations.map(async (loc) => {
                if (loc.id === sourceId) {
                    const newLoc = { ...loc };
                    (newLoc as any)[`marka${reviseSlot}Opsiyon`] = '';
                    const anyLeft = newLoc.marka1Opsiyon || newLoc.marka2Opsiyon || newLoc.marka3Opsiyon || newLoc.marka4Opsiyon;
                    if (!anyLeft) newLoc.durum = 'BOŞ' as const;

                    // Backend update for source
                    if (loc.id.length > 20) {
                        const existingBookings = await bookingsService.getAll();
                        const existing = existingBookings.find(b => b.inventory_item_id === loc.id && b.start_date === selectedWeek);
                        if (existing) {
                            await bookingsService.update(existing.id, {
                                brand_option_1: newLoc.marka1Opsiyon,
                                brand_option_2: newLoc.marka2Opsiyon,
                                brand_option_3: newLoc.marka3Opsiyon,
                                brand_option_4: newLoc.marka4Opsiyon,
                                status: newLoc.durum
                            });
                        }
                    }
                    return newLoc;
                }
                if (loc.id === reviseTargetId) {
                    const newLoc = { ...loc };
                    if (!(newLoc as any)[`marka${reviseSlot}Opsiyon`]) {
                        (newLoc as any)[`marka${reviseSlot}Opsiyon`] = brandToMove;
                    } else {
                        if (!newLoc.marka1Opsiyon) newLoc.marka1Opsiyon = String(brandToMove);
                        else if (!newLoc.marka2Opsiyon) newLoc.marka2Opsiyon = String(brandToMove);
                        else if (!newLoc.marka3Opsiyon) newLoc.marka3Opsiyon = String(brandToMove);
                        else if (!newLoc.marka4Opsiyon) newLoc.marka4Opsiyon = String(brandToMove);
                    }
                    newLoc.durum = 'OPSİYON' as const;

                    // Backend update for target
                    if (loc.id.length > 20) {
                        const existingBookings = await bookingsService.getAll();
                        const existing = existingBookings.find(b => b.inventory_item_id === loc.id && b.start_date === selectedWeek);
                        const bookingData = {
                            inventory_item_id: loc.id,
                            brand_option_1: newLoc.marka1Opsiyon,
                            brand_option_2: newLoc.marka2Opsiyon,
                            brand_option_3: newLoc.marka3Opsiyon,
                            brand_option_4: newLoc.marka4Opsiyon,
                            start_date: selectedWeek,
                            end_date: selectedWeek,
                            status: newLoc.durum,
                            network: String(selectedNetwork)
                        };

                        if (existing) {
                            await bookingsService.update(existing.id, bookingData);
                        } else {
                            await bookingsService.create(bookingData);
                        }
                    }
                    return newLoc;
                }
                return loc;
            }));

            setLocations(updated as any);
            localStorage.setItem('inventoryLocations', JSON.stringify(updated));
            setShowReviseModal(false);
            setReviseTargetId('');
            setSelectedRows([]);
            toastSuccess('Rezervasyon başarıyla başka bir lokasyona kaydırıldı.');
        } catch (error) {
            console.error('Revision error:', error);
            toastInfo('Kaydırma işlemi sırasında hata oluştu.');
        }
    }

    // İstatistikler
    const stats = {
        total: filteredLocations.length,
        opsiyon: filteredLocations.filter(l => l.durum === 'OPSİYON').length,
        kesin: filteredLocations.filter(l => l.durum === 'KESİN').length,
        bos: filteredLocations.filter(l => l.durum === 'BOŞ').length,
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
                    <p className="text-gray-500">Hafta ve network bazlı lokasyon ataması ve liste yönetimi</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 text-sm font - medium border-b - 2 transition - colors ${activeTab === 'list'
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        } `}
                >
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Haftalık Liste
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 text-sm font - medium border-b - 2 transition - colors ${activeTab === 'requests'
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 font-bold'
                        } `}
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Gelen Talepler
                        {reservationRequests.filter(r => r.status === 'pending').length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                                {reservationRequests.filter(r => r.status === 'pending').length}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {activeTab === 'list' ? (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-700">Filtreleme Seçenekleri</h3>
                            <button
                                onClick={handleResetData}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Verileri Sıfırla
                            </button>
                        </div>
                        {/* İlk Satır - Ana Filtreler */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Yıl</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ay</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {monthOptions.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hafta</label>
                                <select
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {weekOptions.map(week => (
                                        <option key={week.value} value={week.value}>{week.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Network</label>
                                <select
                                    value={selectedNetwork}
                                    onChange={(e) => setSelectedNetwork(parseInt(e.target.value))}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {networkOptions.map(net => (
                                        <option key={net} value={net}>Network {net}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">İlçe</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {districtOptions.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Semt</label>
                                <select
                                    value={selectedNeighborhood}
                                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {neighborhoodOptions.map(neighborhood => (
                                        <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ürün Tipi</label>
                                <select
                                    value={selectedProductType}
                                    onChange={(e) => setSelectedProductType(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {productTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ara</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Örn: Adres, kod..."
                                        className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Seçili Filtreler Özeti */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">Aktif Filtreler:</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                {selectedYear}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {selectedMonth}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Network {selectedNetwork}
                            </span>
                            {selectedDistrict !== 'Tümü' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    {selectedDistrict}
                                </span>
                            )}
                            {selectedNeighborhood !== 'Tümü' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                    {selectedNeighborhood}
                                </span>
                            )}
                            {selectedProductType !== 'Tümü' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {selectedProductType}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Toplam Lokasyon</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Opsiyon</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.opsiyon}</p>
                                </div>
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Kesin</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.kesin}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Boş</p>
                                    <p className="text-2xl font-bold text-gray-400 mt-1">{stats.bos}</p>
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowAssignModal(true)}
                            disabled={selectedRows.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Otomatik Atama ({selectedRows.length})
                        </button>
                        <button
                            onClick={() => {
                                if (selectedRows.length !== 1) {
                                    alert('Lütfen sadece bir lokasyon seçin!');
                                    return;
                                }
                                setShowReviseModal(true);
                            }}
                            disabled={selectedRows.length !== 1}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Revize Et (Kaydır)
                        </button>
                        <button
                            onClick={handleConfirmSelected}
                            disabled={selectedRows.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check className="w-5 h-5" />
                            Kesine Çevir ({selectedRows.length})
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Excel Dışa Aktar
                        </button>
                        <button
                            onClick={handleSendEmail}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                            Mail Gönder
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selectedRows.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-5 h-5" />
                            Seçilenleri Sil ({selectedRows.length})
                        </button>
                    </div>


                    {/* Lokasyon Tablosu */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Lokasyon Listesi - {selectedWeek} - Network {selectedNetwork}
                            </h3>
                            <span className="text-sm text-gray-500">{filteredLocations.length} kayıt</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-red-600 text-white">
                                    <tr>
                                        <th className="px-3 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.length === filteredLocations.length && filteredLocations.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded"
                                            />
                                        </th>
                                        <th className="px-3 py-3 text-left font-semibold">Yıl</th>
                                        <th className="px-3 py-3 text-left font-semibold">Ay</th>
                                        <th className="px-3 py-3 text-left font-semibold">Hafta</th>
                                        <th className="px-3 py-3 text-left font-semibold">Koordinat</th>
                                        <th className="px-3 py-3 text-left font-semibold">İlçe</th>
                                        <th className="px-3 py-3 text-left font-semibold">Semt</th>
                                        <th className="px-3 py-3 text-left font-semibold">Adres</th>
                                        <th className="px-3 py-3 text-left font-semibold">Kod</th>
                                        <th className="px-3 py-3 text-left font-semibold">Network</th>
                                        <th className="px-3 py-3 text-left font-semibold">Rout No</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Marka 1.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Marka 2.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Marka 3.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Marka 4.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLocations.map((loc, index) => (
                                        <tr
                                            key={loc.id}
                                            className={`hover: bg-gray - 50 transition - colors ${selectedRows.includes(loc.id) ? 'bg-primary-50' : ''
                                                } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} `}
                                        >
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(loc.id)}
                                                    onChange={() => handleSelectRow(loc.id)}
                                                    className="w-4 h-4 rounded"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">{loc.yil}</td>
                                            <td className="px-3 py-2 text-gray-900">{loc.ay}</td>
                                            <td className="px-3 py-2 text-gray-900">{loc.hafta}</td>
                                            <td className="px-3 py-2 text-gray-600 text-xs">{loc.koordinat}</td>
                                            <td className="px-3 py-2 text-gray-900">{loc.ilce}</td>
                                            <td className="px-3 py-2 text-gray-900">{loc.semt}</td>
                                            <td className="px-3 py-2 text-gray-900 max-w-xs truncate" title={loc.adres}>{loc.adres}</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                                    {loc.kod}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-900">{loc.network}</td>
                                            <td className="px-3 py-2 text-primary-600 font-bold">{loc.routeNo || '-'}</td>
                                            <td className="px-3 py-2 text-primary-700 font-medium">{loc.marka1Opsiyon || '-'}</td>
                                            <td className="px-3 py-2 text-blue-700 font-medium">{loc.marka2Opsiyon || '-'}</td>
                                            <td className="px-3 py-2 text-purple-700 font-medium">{loc.marka3Opsiyon || '-'}</td>
                                            <td className="px-3 py-2 text-orange-700 font-medium">{loc.marka4Opsiyon || '-'}</td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={loc.durum}
                                                    onChange={(e) => handleStatusChange(loc.id, e.target.value as 'OPSİYON' | 'KESİN' | 'BOŞ')}
                                                    className={`px-2 py-1 rounded text-xs font - semibold border-0 ${loc.durum === 'OPSİYON' ? 'bg-yellow-100 text-yellow-800' :
                                                        loc.durum === 'KESİN' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-600'
                                                        } `}
                                                >
                                                    <option value="OPSİYON">OPSİYON</option>
                                                    <option value="KESİN">KESİN</option>
                                                    <option value="BOŞ">BOŞ</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredLocations.length === 0 && (
                            <div className="p-12 text-center">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Lokasyon Bulunamadı</h3>
                                <p className="text-sm text-gray-500">Seçilen kriterlere uygun lokasyon bulunmuyor</p>
                            </div>
                        )}
                    </div>

                    {/* Otomatik Atama Modal */}
                    {showAssignModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Otomatik Marka Atama</h2>
                                    <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>{selectedRows.length}</strong> adet lokasyon seçildi.
                                            Bu lokasyonlara otomatik olarak marka ataması yapılacak.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Opsiyon Numarası</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setSelectedOpsiyonNumber(num as 1 | 2 | 3 | 4)}
                                                    className={`px-4 py-2 rounded-lg text-sm font - medium transition - colors ${selectedOpsiyonNumber === num
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        } `}
                                                >
                                                    {num}. Opsiyon
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Hangi opsiyon alanına marka atanacak?</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marka Adı</label>
                                        <input
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="Örn: FORD, TOYOTA, BMW"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleAutoAssign}
                                        disabled={isAutoAssigning}
                                        className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isAutoAssigning ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Atama Yapılıyor...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Atamayı Uygula
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revize Et (Aktar/Kaydır) Modal */}
                    {showReviseModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-50">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="w-6 h-6 text-orange-600" />
                                        <h2 className="text-xl font-bold text-gray-900">Rezervasyon Kaydır / Revize Et</h2>
                                    </div>
                                    <button onClick={() => setShowReviseModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                        <p className="text-sm text-orange-800">
                                            Seçilen <strong>{locations.find(l => l.id === selectedRows[0])?.kod}</strong> kodlu lokasyondaki bir markayı başka bir boş lokasyona aktarabilirsiniz.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hangi Markayı Kaydırmak İstiyorsunuz?</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[1, 2, 3, 4].map((num) => {
                                                const brand = (locations.find(l => l.id === selectedRows[0]) as any)?.[`marka${num} Opsiyon`];
                                                return (
                                                    <button
                                                        key={num}
                                                        onClick={() => setReviseSlot(num as 1 | 2 | 3 | 4)}
                                                        disabled={!brand}
                                                        className={`p - 3 rounded-xl border-2 transition - all flex flex - col items-center justify-center gap-1 ${reviseSlot === num
                                                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                                                            : brand
                                                                ? 'border-gray-200 bg-white hover:border-gray-300'
                                                                : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                                                            } `}
                                                    >
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Opsiyon {num}</span>
                                                        <span className="text-sm font-black truncate w-full text-center">{brand || '-'}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hedef Lokasyon Seçin</label>
                                        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                            <table className="w-full text-xs">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="p-2 text-left">Kod</th>
                                                        <th className="p-2 text-left">Adres / Semt</th>
                                                        <th className="p-2 text-left">Mevcut Durum</th>
                                                        <th className="p-2 text-center underline">Seç</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filteredLocations.filter(l => l.id !== selectedRows[0]).map(loc => (
                                                        <tr
                                                            key={loc.id}
                                                            onClick={() => setReviseTargetId(loc.id)}
                                                            className={`cursor - pointer transition - colors ${reviseTargetId === loc.id ? 'bg-orange-50' : 'hover:bg-gray-50'} `}
                                                        >
                                                            <td className="p-2 font-bold">{loc.kod}</td>
                                                            <td className="p-2">
                                                                <p className="font-medium truncate max-w-[200px]">{loc.adres}</p>
                                                                <p className="text-[10px] text-gray-500">{loc.ilce} / {loc.semt}</p>
                                                            </td>
                                                            <td className="p-2 text-[10px]">
                                                                <span className={`px-1.5 py-0.5 rounded-full font - bold ${loc.durum === 'BOŞ' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'} `}>
                                                                    {loc.durum === 'BOŞ' ? 'BOŞ' : 'DOLU'}
                                                                </span>
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <div className={`w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center transition - all ${reviseTargetId === loc.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'} `}>
                                                                    {reviseTargetId === loc.id && <Check className="w-3 h-3" />}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowReviseModal(false)}
                                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleSaveRevision}
                                        disabled={!reviseTargetId}
                                        className="px-8 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Kaydı Aktar (Revize Et)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-6">
                    {/* Gelen Talepler Sekmesi */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-gray-900">Gelen Yer Listesi Talepleri</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    fetchData();
                                    toastInfo('Talepler güncellendi.')
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors border border-primary-100"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoadingRequests || isLoadingLocations ? 'animate-spin' : ''}`} />
                                Talepleri Yenile
                            </button>
                            <button
                                onClick={handleMigrateInventory}
                                disabled={isLoadingLocations}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
                            >
                                <Download className="w-4 h-4" />
                                Envanteri Aktar
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Tüm işlenmiş (tamamlanmış) talepleri listeden kaldırmak istediğinize emin misiniz?')) {
                                        const completed = reservationRequests.filter(r => r.status === 'completed');
                                        try {
                                            for (const req of completed) {
                                                await customerRequestsService.delete(req.id);
                                            }
                                            fetchData();
                                            toastSuccess('İşlenmiş talepler backend\'den temizlendi.');
                                        } catch (error) {
                                            console.error('Error clearing requests:', error);
                                            toastInfo('Bazı talepler temizlenirken hata oluştu.');
                                        }
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                            >
                                <X className="w-4 h-4" />
                                İşlenenleri Temizle
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reservationRequests.length > 0 ? (
                            reservationRequests.map((req) => (
                                <div key={req.id} className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${req.status === 'completed' ? 'border-green-100 opacity-75' : 'border-blue-100 shadow-blue-100/50'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <FileSpreadsheet className="w-6 h-6" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                                            {req.status === 'completed' ? 'İŞLENDİ' : 'YENİ TALEP'}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Müşteri & Marka</p>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{req.customerName}</h3>
                                            <p className="text-sm text-indigo-600 font-medium">{req.brandName}</p>
                                        </div>

                                        <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">Dönem:</span>
                                                <span className="font-bold text-gray-700">{req.year} / {req.month}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">Hafta:</span>
                                                <span className="font-bold text-gray-700">{req.week?.split(' ')[0]}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">Ürün / Network:</span>
                                                <span className="font-bold text-gray-700">{req.productType} - Net {req.network}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-green-50 rounded-lg border border-green-100 text-center">
                                                <p className="text-[10px] text-green-600 font-bold">BOŞ YER</p>
                                                <p className="text-lg font-black text-green-700">{req.availableCount}</p>
                                            </div>
                                            <div className="p-2 bg-orange-50 rounded-lg border border-orange-100 text-center">
                                                <p className="text-[10px] text-orange-600 font-bold">OPSİYON</p>
                                                <p className="text-lg font-black text-orange-700">{req.optionsCount}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 italic">Talep: {new Date(req.createdAt).toLocaleDateString()}</span>
                                            {req.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleProcessRequest(req)}
                                                    className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2 shadow-md shadow-primary-200"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Talebi İşle
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                    <CheckCircle className="w-4 h-4" />
                                                    İşlendi
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Bekleyen Talep Yok</h3>
                                <p className="text-gray-500">Satış departmanından gelen yeni yer talepleri burada listelenecek.</p>
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    )
}
