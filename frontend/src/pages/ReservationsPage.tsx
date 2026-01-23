import { useState, useMemo, useEffect } from 'react'
import { FileSpreadsheet, MapPin, Search, Filter, Calendar, Clock, Check, X, CheckCircle, Smartphone, RefreshCw, ChevronRight, ChevronLeft, Download, Plus, Trash2, AlertCircle, CalendarDays, Send } from 'lucide-react'
import { reservationsData } from '../data/reservations'
import { useToast } from '../hooks/useToast'
import { inventoryService, bookingsService, customerRequestsService, proposalsService, clientsService } from '../services'
import LocationRequestModal from '../components/proposals/LocationRequestModal'
import * as XLSX from 'xlsx'

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

    // Müşteri listesi (Ticari Ünvan dropdown için)
    const [customers, setCustomers] = useState<{ id: string, companyName: string }[]>([])

    // Dinamik network listesi
    const [availableNetworks, setAvailableNetworks] = useState<string[]>(['Tümü', '1', '2', '3', '4', 'BLD'])

    // Sabit Seçenekler
    const allMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const yearOptions = [2026, 2027, 2028, 2029, 2030]
    const productTypes = ['Tümü', 'BB', 'CLP', 'MGL', 'LB', 'GB', 'MB', 'KB']

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

    const [activeTab, setActiveTab] = useState<'list' | 'requests' | 'proposals'>('list')
    const [reservationRequests, setReservationRequests] = useState<any[]>([])
    const [isLoadingRequests, setIsLoadingRequests] = useState(false)
    const [isLoadingLocations, setIsLoadingLocations] = useState(false)
    const [proposals, setProposals] = useState<any[]>([])
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<any | null>(null)

    // Onay modalı için state'ler
    const [showProcessModal, setShowProcessModal] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [processAvailability, setProcessAvailability] = useState<{ available: any[], options: any[], occupied: any[] }>({ available: [], options: [], occupied: [] })
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

    const { success: toastSuccess, info: toastInfo } = useToast()

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

    // Helper function to convert DD.MM.YYYY to YYYY-MM-DD for backend
    const toBackendDate = (dateStr: string): string => {
        if (!dateStr) return '';
        if (dateStr.includes('.')) {
            const [d, m, y] = dateStr.split('.');
            return `${y}-${m}-${d}`;
        }
        return dateStr;
    };

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

            // 2. Fetch Inventory, Bookings, Proposals and Clients
            const [inventory, bookings, proposalsData, clientsData] = await Promise.all([
                inventoryService.getAll(),
                bookingsService.getAll(),
                proposalsService.getAll(),
                clientsService.getAll()
            ]);

            setProposals(proposalsData);

            // Müşteri listesini güncelle (Ticari Ünvan dropdown için)
            const customerList = clientsData.map((c: any) => ({
                id: c.id,
                companyName: c.company_name || c.name || ''
            })).filter((c: any) => c.companyName);
            setCustomers(customerList);

            // Envanterdeki tüm benzersiz network değerlerini al
            const uniqueNetworks = Array.from(new Set(
                inventory.map((item: any) => String(item.network || '1'))
            )).sort();

            // 'Tümü' seçeneğini her zaman en başa ekle
            setAvailableNetworks(['Tümü', ...uniqueNetworks]);


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
                    network: item.network || '1',
                    marka1Opsiyon: booking?.brand_option_1 || '',
                    marka2Opsiyon: booking?.brand_option_2 || '',
                    marka3Opsiyon: booking?.brand_option_3 || '',
                    marka4Opsiyon: booking?.brand_option_4 || '',
                    durum: (booking?.status as any) || 'BOŞ',
                    productType: item.type as any
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
        fetchData();
    }, [selectedYear, selectedMonth, selectedWeek, selectedNetwork]);

    useEffect(() => {
        // Set up periodic refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [selectedYear, selectedMonth, selectedWeek, selectedNetwork]);

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

    // Müsaitlik kontrolü yap ve modalı aç
    const handleOpenProcessModal = async (request: any) => {
        setSelectedRequest(request);
        setShowProcessModal(true);
        setIsCheckingAvailability(true);

        try {
            const [inventory, allBookings] = await Promise.all([
                inventoryService.getAll(),
                bookingsService.getAll()
            ]);

            const targetIds = (request.selectedLocations || []).map((sl: any) => sl.id);

            // Filter matching inventory
            const matchingInventory = inventory.filter(item => {
                const itemNet = String(item.network).toUpperCase();
                const reqNet = String(request.network).toUpperCase();
                const isNetMatch = itemNet === reqNet ||
                    (itemNet === 'BELEDİYE' && reqNet === 'BLD') ||
                    (itemNet === 'BLD' && reqNet === 'BELEDİYE');
                return isNetMatch && item.type === request.productType;
            });

            const targetWeek = normalizeDate(request.week);
            const periodBookings = allBookings.filter(b => normalizeDate(b.start_date) === targetWeek);

            const available: any[] = [];
            const options: any[] = [];
            const occupied: any[] = [];

            matchingInventory.forEach(item => {
                const booking = periodBookings.find(b => b.inventory_item_id === item.id);
                const isSelected = targetIds.includes(item.id);

                // Check next available slot
                let nextSlot = 1;
                if (booking) {
                    if (booking.status === 'KESİN') {
                        if (!booking.brand_option_2) nextSlot = 2;
                        else if (!booking.brand_option_3) nextSlot = 3;
                        else if (!booking.brand_option_4) nextSlot = 4;
                        else nextSlot = 5;
                    } else if (booking.status === 'OPSİYON') {
                        if (!booking.brand_option_1) nextSlot = 1;
                        else if (!booking.brand_option_2) nextSlot = 2;
                        else if (!booking.brand_option_3) nextSlot = 3;
                        else if (!booking.brand_option_4) nextSlot = 4;
                        else nextSlot = 5;
                    }
                }

                const uiItem = {
                    id: item.id,
                    kod: item.code,
                    ilce: item.district,
                    semt: item.neighborhood,
                    isSelected,
                    booking,
                    nextSlot
                };

                if (!booking || (booking.status === 'BOŞ' && nextSlot === 1)) {
                    if (isSelected || available.length < (request.availableCount + request.optionsCount)) {
                        available.push(uiItem);
                    }
                } else if (nextSlot <= 4) {
                    options.push(uiItem);
                } else {
                    occupied.push(uiItem);
                }
            });

            setProcessAvailability({ available, options, occupied });
        } catch (error) {
            console.error('Availability check error:', error);
            toastInfo('Müsaitlik kontrolü yapılırken hata oluştu.');
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    // Onaydan sonra talebi işle
    const handleConfirmProcessRequest = async () => {
        if (!selectedRequest) return;

        setIsLoadingRequests(true);
        setIsLoadingLocations(true);
        try {
            const [inventory, allBookings] = await Promise.all([
                inventoryService.getAll(),
                bookingsService.getAll()
            ]);

            const targetIds = (selectedRequest.selectedLocations || []).map((sl: any) => sl.id);
            const requestedCount = selectedRequest.availableCount + selectedRequest.optionsCount || targetIds.length || 20;

            // Filter matching inventory
            const matchingInventory = inventory.filter(item => {
                const itemNet = String(item.network).toUpperCase();
                const reqNet = String(selectedRequest.network).toUpperCase();
                const isNetMatch = itemNet === reqNet ||
                    (itemNet === 'BELEDİYE' && reqNet === 'BLD') ||
                    (itemNet === 'BLD' && reqNet === 'BELEDİYE');
                return isNetMatch && item.type === selectedRequest.productType;
            });

            const targetWeek = normalizeDate(selectedRequest.week);
            const periodBookings = allBookings.filter(b => normalizeDate(b.start_date) === targetWeek);

            const selectedAvailable: any[] = [];
            const autoAvailable: any[] = [];
            const partiallyAvailable: any[] = [];

            matchingInventory.forEach(item => {
                const booking = periodBookings.find(b => b.inventory_item_id === item.id);
                const isIdSelected = targetIds.includes(item.id);

                let nextSlot = 1;
                if (booking) {
                    if (booking.status === 'KESİN') {
                        if (!booking.brand_option_2) nextSlot = 2;
                        else if (!booking.brand_option_3) nextSlot = 3;
                        else if (!booking.brand_option_4) nextSlot = 4;
                        else nextSlot = 5;
                    } else {
                        if (!booking.brand_option_1) nextSlot = 1;
                        else if (!booking.brand_option_2) nextSlot = 2;
                        else if (!booking.brand_option_3) nextSlot = 3;
                        else if (!booking.brand_option_4) nextSlot = 4;
                        else nextSlot = 5;
                    }
                }

                if (nextSlot === 1 && (!booking || booking.status === 'BOŞ')) {
                    if (isIdSelected) selectedAvailable.push({ item, booking: null });
                    else autoAvailable.push({ item, booking: null });
                } else if (nextSlot <= 4) {
                    if (isIdSelected) selectedAvailable.push({ item, booking });
                    else partiallyAvailable.push({ item, booking });
                }
            });

            const candidates = [...selectedAvailable, ...autoAvailable, ...partiallyAvailable];
            const toAssign = candidates.slice(0, requestedCount);

            if (toAssign.length === 0) {
                toastInfo('Maalesef bu kriterlere uygun müsait lokasyon bulunamadı.');
                setShowProcessModal(false);
                return;
            }

            const brandUpper = (selectedRequest.customerName || selectedRequest.brandName).toUpperCase();

            // Perform assignments
            for (const { item, booking } of toAssign) {
                if (booking) {
                    const updateData = { ...booking };
                    if (!updateData.brand_option_1) updateData.brand_option_1 = brandUpper;
                    else if (!updateData.brand_option_2) updateData.brand_option_2 = brandUpper;
                    else if (!updateData.brand_option_3) updateData.brand_option_3 = brandUpper;
                    else if (!updateData.brand_option_4) updateData.brand_option_4 = brandUpper;

                    await bookingsService.update(booking.id, {
                        ...updateData,
                        status: booking.status === 'KESİN' ? 'KESİN' : 'OPSİYON'
                    });
                } else {
                    await bookingsService.create({
                        inventory_item_id: item.id,
                        brand_name: selectedRequest.brandName,
                        network: String(selectedRequest.network),
                        start_date: toBackendDate(targetWeek),
                        end_date: toBackendDate(targetWeek),
                        status: 'OPSİYON',
                        brand_option_1: brandUpper
                    });
                }
            }

            // Mark request as completed
            await customerRequestsService.update(selectedRequest.id, { status: 'completed' });

            // Update UI
            setSelectedYear(selectedRequest.year);
            setSelectedMonth(selectedRequest.month);
            setSelectedWeek(normalizeDate(selectedRequest.week));
            setSelectedNetwork(selectedRequest.network);
            setActiveTab('list');
            setShowProcessModal(false);
            setSelectedRequest(null);

            await fetchData();

            toastSuccess(`${selectedRequest.customerName} talebi için ${toAssign.length} lokasyon başarıyla opsiyon olarak atandı.`);
            if (toAssign.length < requestedCount) {
                toastInfo(`Not: Talep edilen ${requestedCount} adetten sadece ${toAssign.length} müsait yer bulunabildi.`);
            }

        } catch (error) {
            console.error('Process request error:', error);
            toastInfo('Talebi işlerken bir hata oluştu.');
        } finally {
            setIsLoadingRequests(false);
            setIsLoadingLocations(false);
        }
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
        (() => {
            if (selectedNetwork === 'Tümü') return true;
            const itemNet = String(loc.network).toUpperCase();
            const filterNet = String(selectedNetwork).toUpperCase();
            return itemNet === filterNet ||
                (itemNet === 'BELEDİYE' && filterNet === 'BLD') ||
                (itemNet === 'BLD' && filterNet === 'BELEDİYE');
        })() &&
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
            alert('Lütfen ticari ünvan girin!')
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
                        start_date: toBackendDate(selectedWeek),
                        end_date: toBackendDate(selectedWeek),
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
            toastSuccess(`${selectedRows.length} adet lokasyona ${brandUpper} ticari ünvanı atandı!`)
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

    // Manuel Ticari Ünvan (Opsiyon) Güncelleme
    const handleManualBrandChange = async (locId: string, slotNumber: 1 | 2 | 3 | 4, newBrand: string) => {
        const brandUpper = newBrand.toUpperCase();

        // UI'da güncelle
        const updated = locations.map(loc => {
            if (loc.id === locId) {
                const newLoc = { ...loc };
                if (slotNumber === 1) newLoc.marka1Opsiyon = brandUpper;
                else if (slotNumber === 2) newLoc.marka2Opsiyon = brandUpper;
                else if (slotNumber === 3) newLoc.marka3Opsiyon = brandUpper;
                else if (slotNumber === 4) newLoc.marka4Opsiyon = brandUpper;

                // Eğer herhangi bir marka atandıysa ve durum BOŞ ise, OPSİYON yap
                if (brandUpper && newLoc.durum === 'BOŞ') {
                    newLoc.durum = 'OPSİYON';
                }
                return newLoc;
            }
            return loc;
        });

        setLocations(updated);
        localStorage.setItem('inventoryLocations', JSON.stringify(updated));

        // Backend'e kaydet
        try {
            const existingBookings = await bookingsService.getAll();
            const existing = existingBookings.find(b =>
                b.inventory_item_id === locId &&
                normalizeDate(b.start_date) === selectedWeek
            );

            const loc = updated.find(l => l.id === locId);
            if (!loc) return;

            const bookingData = {
                inventory_item_id: locId,
                brand_option_1: loc.marka1Opsiyon,
                brand_option_2: loc.marka2Opsiyon,
                brand_option_3: loc.marka3Opsiyon,
                brand_option_4: loc.marka4Opsiyon,
                start_date: toBackendDate(selectedWeek),
                end_date: toBackendDate(selectedWeek),
                status: loc.durum,
                network: String(selectedNetwork)
            };

            if (existing) {
                await bookingsService.update(existing.id, bookingData);
            } else {
                await bookingsService.create(bookingData);
            }

            toastSuccess(`${loc.kod} - ${slotNumber}. opsiyon güncellendi: ${brandUpper || 'Temizlendi'}`);
        } catch (error) {
            console.error('Manual brand update error:', error);
            toastInfo('Güncelleme kaydedilirken hata oluştu.');
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
        const exportData = filteredLocations.map(loc => ({
            'Yıl': loc.yil,
            'Ay': loc.ay,
            'Hafta': loc.hafta,
            'Koordinat': loc.koordinat,
            'İlçe': loc.ilce,
            'Semt': loc.semt,
            'Adres': loc.adres,
            'Kod': loc.kod,
            'Rout No': loc.routeNo || '-',
            'Network': loc.network,
            'Marka 1.Opsiyon': loc.marka1Opsiyon,
            'Marka 2.Opsiyon': loc.marka2Opsiyon,
            'Marka 3.Opsiyon': loc.marka3Opsiyon,
            'Marka 4.Opsiyon': loc.marka4Opsiyon,
            'Durum': loc.durum
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rezervasyonlar')

        // Generate filename
        const filename = `rezervasyon_${selectedWeek.replace(/\./g, '_')}_network${selectedNetwork}.xlsx`

        // Export file
        XLSX.writeFile(workbook, filename)
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
                            start_date: toBackendDate(selectedWeek),
                            end_date: toBackendDate(selectedWeek),
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
                            start_date: toBackendDate(selectedWeek),
                            end_date: toBackendDate(selectedWeek),
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

    const approvedProposals = useMemo(() => {
        return proposals.filter(p => p.status?.toLowerCase() === 'approved' || p.status?.toLowerCase() === 'sent');
    }, [proposals]);

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
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'list'
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Haftalık Liste
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('proposals')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'proposals'
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 font-bold'
                        } `}
                >
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        Onaylı Teklifler
                        {approvedProposals.length > 0 && (
                            <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {approvedProposals.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'requests'
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 font-bold'
                        }`}
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

            {activeTab === 'list' && (
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
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                                    onChange={(e) => setSelectedNetwork(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                >
                                    {availableNetworks.map(net => (
                                        <option key={net} value={net}>
                                            {net === 'Tümü' ? 'Tüm Networkler' : `Network ${net}`}
                                        </option>
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
                            {selectedProductType !== 'Tümü' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {selectedProductType}
                                </span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                {selectedYear}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {selectedMonth}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Network {selectedNetwork}
                            </span>
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
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Ticari Ünvan 1.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Ticari Ünvan 2.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Ticari Ünvan 3.Opsiyon</th>
                                        <th className="px-3 py-3 text-left font-semibold bg-green-700">Ticari Ünvan 4.Opsiyon</th>
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
                                            <td className="px-1 py-1">
                                                <select
                                                    value={loc.marka1Opsiyon || ''}
                                                    onChange={(e) => handleManualBrandChange(loc.id, 1, e.target.value)}
                                                    className="w-full px-1 py-1 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded focus:ring-1 focus:ring-primary-500 truncate"
                                                    title={loc.marka1Opsiyon || 'Seçiniz'}
                                                >
                                                    <option value="">-</option>
                                                    {customers.map(c => (
                                                        <option key={c.id} value={c.companyName}>{c.companyName}</option>
                                                    ))}
                                                    {loc.marka1Opsiyon && !customers.find(c => c.companyName === loc.marka1Opsiyon) && (
                                                        <option value={loc.marka1Opsiyon}>{loc.marka1Opsiyon}</option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1">
                                                <select
                                                    value={loc.marka2Opsiyon || ''}
                                                    onChange={(e) => handleManualBrandChange(loc.id, 2, e.target.value)}
                                                    className="w-full px-1 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 truncate"
                                                    title={loc.marka2Opsiyon || 'Seçiniz'}
                                                >
                                                    <option value="">-</option>
                                                    {customers.map(c => (
                                                        <option key={c.id} value={c.companyName}>{c.companyName}</option>
                                                    ))}
                                                    {loc.marka2Opsiyon && !customers.find(c => c.companyName === loc.marka2Opsiyon) && (
                                                        <option value={loc.marka2Opsiyon}>{loc.marka2Opsiyon}</option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1">
                                                <select
                                                    value={loc.marka3Opsiyon || ''}
                                                    onChange={(e) => handleManualBrandChange(loc.id, 3, e.target.value)}
                                                    className="w-full px-1 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded focus:ring-1 focus:ring-purple-500 truncate"
                                                    title={loc.marka3Opsiyon || 'Seçiniz'}
                                                >
                                                    <option value="">-</option>
                                                    {customers.map(c => (
                                                        <option key={c.id} value={c.companyName}>{c.companyName}</option>
                                                    ))}
                                                    {loc.marka3Opsiyon && !customers.find(c => c.companyName === loc.marka3Opsiyon) && (
                                                        <option value={loc.marka3Opsiyon}>{loc.marka3Opsiyon}</option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-1 py-1">
                                                <select
                                                    value={loc.marka4Opsiyon || ''}
                                                    onChange={(e) => handleManualBrandChange(loc.id, 4, e.target.value)}
                                                    className="w-full px-1 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded focus:ring-1 focus:ring-orange-500 truncate"
                                                    title={loc.marka4Opsiyon || 'Seçiniz'}
                                                >
                                                    <option value="">-</option>
                                                    {customers.map(c => (
                                                        <option key={c.id} value={c.companyName}>{c.companyName}</option>
                                                    ))}
                                                    {loc.marka4Opsiyon && !customers.find(c => c.companyName === loc.marka4Opsiyon) && (
                                                        <option value={loc.marka4Opsiyon}>{loc.marka4Opsiyon}</option>
                                                    )}
                                                </select>
                                            </td>
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
                                    <h2 className="text-xl font-semibold text-gray-900">Otomatik Ticari Ünvan Atama</h2>
                                    <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>{selectedRows.length}</strong> adet lokasyon seçildi.
                                            Bu lokasyonlara otomatik olarak ticari ünvan ataması yapılacak.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Opsiyon Numarası</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setSelectedOpsiyonNumber(num as 1 | 2 | 3 | 4)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedOpsiyonNumber === num
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {num}. Opsiyon
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Hangi opsiyon alanına marka atanacak?</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ticari Ünvan</label>
                                        <input
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="Örn: AZİMEDYA REKLAM HİZMETLERİ LTD. ŞTİ."
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
                                                const brand = (locations.find(l => l.id === selectedRows[0]) as any)?.[`marka${num}Opsiyon`];
                                                return (
                                                    <button
                                                        key={num}
                                                        onClick={() => setReviseSlot(num as 1 | 2 | 3 | 4)}
                                                        disabled={!brand}
                                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${reviseSlot === num
                                                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                                                            : brand
                                                                ? 'border-gray-200 bg-white hover:border-gray-300'
                                                                : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                                                            }`}
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
                                                            className={`cursor-pointer transition-colors ${reviseTargetId === loc.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className="p-2 font-bold">{loc.kod}</td>
                                                            <td className="p-2">
                                                                <p className="font-medium truncate max-w-[200px]">{loc.adres}</p>
                                                                <p className="text-[10px] text-gray-500">{loc.ilce} / {loc.semt}</p>
                                                            </td>
                                                            <td className="p-2 text-[10px]">
                                                                <span className={`px-1.5 py-0.5 rounded-full font-bold ${loc.durum === 'BOŞ' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {loc.durum === 'BOŞ' ? 'BOŞ' : 'DOLU'}
                                                                </span>
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <div className={`w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${reviseTargetId === loc.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'}`}>
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
            )}

            {activeTab === 'proposals' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Onaylı Bütçe Teklifleri</h2>
                                <p className="text-gray-500">Yer talebi oluşturulmayı bekleyen onaylı teklifler</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {approvedProposals.length > 0 ? (
                                approvedProposals.map((proposal) => (
                                    <div key={proposal.id} className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-lg">
                                                            {proposal.proposal_number || proposal.id} - {proposal.client?.company_name || proposal.customerName}
                                                        </h4>
                                                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase">
                                                            ONAYLANDI
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : '-'}
                                                        </span>
                                                        <span className="font-bold text-gray-900">
                                                            ₺{proposal.total?.toLocaleString() || proposal.totalAmount?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedProposal({
                                                        ...proposal,
                                                        customerName: proposal.client?.company_name || proposal.customerName,
                                                        proposalNumber: proposal.proposal_number || proposal.id,
                                                        grandTotal: proposal.total || proposal.totalAmount,
                                                        kdvAmount: proposal.tax_amount || proposal.kdvAmount,
                                                        createdAt: proposal.created_at,
                                                        items: (proposal.items || []).map((item: any) => ({
                                                            code: item.description,
                                                            quantity: item.quantity,
                                                            unitPrice: item.unit_price
                                                        }))
                                                    });
                                                    setIsLocationModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                            >
                                                <MapPin className="w-5 h-5" />
                                                Yer Talebi Oluştur
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <FileSpreadsheet className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Onaylı Teklif Bulunamadı</h3>
                                    <p className="text-gray-500">Yer talebi oluşturulabilecek onaylanmış bütçe teklifi bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
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

                                        {/* Seçilen Yerler Listesi */}
                                        {req.selectedLocations && req.selectedLocations.length > 0 && (
                                            <div className="mt-3 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                                <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1">Talep Edilen Yerler ({req.selectedLocations.length} adet)</p>
                                                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                                    {req.selectedLocations.slice(0, 8).map((loc: any, idx: number) => (
                                                        <span key={idx} className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-indigo-100 text-indigo-700 font-mono">
                                                            {loc.kod}
                                                        </span>
                                                    ))}
                                                    {req.selectedLocations.length > 8 && (
                                                        <span className="text-[9px] text-indigo-500">+{req.selectedLocations.length - 8} daha...</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 italic">Talep: {new Date(req.createdAt).toLocaleDateString()}</span>
                                            {req.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleOpenProcessModal(req)}
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
            )}

            <LocationRequestModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                proposal={selectedProposal ? {
                    id: selectedProposal.id,
                    proposal_number: selectedProposal.proposalNumber || selectedProposal.id,
                    title: `Teklif - ${selectedProposal.customerName}`,
                    client_id: selectedProposal.client_id || selectedProposal.customerId,
                    created_by_id: 'admin',
                    client: { name: selectedProposal.customerName } as any,
                    items: (selectedProposal.items || []).map((item: any, i: number) => ({
                        id: String(i),
                        proposal_id: selectedProposal.id,
                        description: item.code,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        total: item.quantity * item.unitPrice,
                        order: i
                    })),
                    status: (selectedProposal.status || '').toUpperCase(),
                    subtotal: selectedProposal.subtotal || selectedProposal.totalAmount,
                    tax_rate: selectedProposal.tax_rate || 20,
                    tax_amount: selectedProposal.tax_amount || selectedProposal.kdvAmount,
                    total: selectedProposal.total || selectedProposal.grandTotal,
                    created_at: selectedProposal.created_at || selectedProposal.createdAt,
                    updated_at: selectedProposal.updated_at || selectedProposal.createdAt
                } as any : null}
                onComplete={() => {
                    fetchData();
                }}
            />

            {/* Talep İşleme Onay Modalı */}
            {showProcessModal && selectedRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-indigo-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Yer Listesi Talebi Onayı</h2>
                                <p className="text-sm text-gray-500">
                                    {selectedRequest.customerName} - {selectedRequest.brandName}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProcessModal(false);
                                    setSelectedRequest(null);
                                }}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Talep Bilgileri */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Dönem</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedRequest.year} / {selectedRequest.month}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Hafta</p>
                                    <p className="text-sm font-bold text-gray-900">{normalizeDate(selectedRequest.week)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Ürün Tipi</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedRequest.productType}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Network</p>
                                    <p className="text-sm font-bold text-gray-900">Net {selectedRequest.network}</p>
                                </div>
                            </div>

                            {/* Müsaitlik Kontrolü */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-primary-600" />
                                    Müsaitlik Kontrol Sonucu
                                </h3>

                                {isCheckingAvailability ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
                                        <span className="ml-3 text-gray-600">Müsaitlik kontrol ediliyor...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                                                <p className="text-xs text-green-600 font-bold uppercase">Boş Yerler</p>
                                                <p className="text-3xl font-black text-green-700">{processAvailability.available.length}</p>
                                                <p className="text-[10px] text-green-500 mt-1">Hemen rezervasyon yapılabilir</p>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                                                <p className="text-xs text-orange-600 font-bold uppercase">Opsiyonlu</p>
                                                <p className="text-3xl font-black text-orange-700">{processAvailability.options.length}</p>
                                                <p className="text-[10px] text-orange-500 mt-1">Alt sıra opsiyon olarak atanabilir</p>
                                            </div>
                                            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                                                <p className="text-xs text-red-600 font-bold uppercase">Tüm Opsiyonlar Dolu</p>
                                                <p className="text-3xl font-black text-red-700">{processAvailability.occupied.length}</p>
                                                <p className="text-[10px] text-red-500 mt-1">Bu dönemde yer kalmadı</p>
                                            </div>
                                        </div>

                                        {/* Talep Edilen Yer Listesi */}
                                        {selectedRequest.selectedLocations && selectedRequest.selectedLocations.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-indigo-600" />
                                                    Talep Edilen Yerler ({selectedRequest.selectedLocations.length} adet)
                                                </h4>
                                                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-gray-50 sticky top-0">
                                                            <tr>
                                                                <th className="p-2 text-left border-b">Kod</th>
                                                                <th className="p-2 text-left border-b">Durum</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedRequest.selectedLocations.map((loc: any, idx: number) => {
                                                                const availItem = processAvailability.available.find(a => a.id === loc.id);
                                                                const optItem = processAvailability.options.find(o => o.id === loc.id);
                                                                const status = availItem ? 'BOŞ' : optItem ? 'OPSİYON' : 'KESİN';
                                                                const statusColor = status === 'BOŞ' ? 'text-green-600 bg-green-50' : status === 'OPSİYON' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';
                                                                return (
                                                                    <tr key={idx} className="border-b">
                                                                        <td className="p-2 font-mono font-bold">{loc.kod}</td>
                                                                        <td className="p-2">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>
                                                                                {status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Uyarı Mesajı */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-900">İşlem Onayı</h4>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Bu talebi onayladığınızda, <strong>{processAvailability.available.length}</strong> boş yer ve
                                                    <strong> {Math.min(processAvailability.options.length, Math.max(0, (selectedRequest.availableCount + selectedRequest.optionsCount) - processAvailability.available.length))}</strong> opsiyonlu yer
                                                    <strong> "{selectedRequest.brandName}"</strong> markası için OPSİYON olarak kaydedilecektir.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowProcessModal(false);
                                    setSelectedRequest(null);
                                }}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleConfirmProcessRequest}
                                disabled={isCheckingAvailability || isLoadingRequests || processAvailability.available.length === 0}
                                className="px-8 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingRequests ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        İşleniyor...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Talebi Onayla ve İşle
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
