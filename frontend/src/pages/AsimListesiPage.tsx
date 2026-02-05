import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    ChevronDown,
    ChevronUp,
    Filter,
    RefreshCw,
    FileText,
    X,
    Package
} from 'lucide-react';
import { bookingsService, inventoryService } from '../services';
import * as XLSX from 'xlsx';

interface AsimData {
    id: string;
    year: number;
    month: string;
    monthNumber: number;
    weekStart: string;
    client: string;
    network: string;
    adet: number;
    kod: string;
    ilce: string;
    semt: string;
    adres: string;
    koordinat: string;
    routNo: string;
    type: string;
}

// Group data hierarchically
interface GroupedData {
    year: number;
    months: {
        month: string;
        monthNumber: number;
        weeks: {
            weekStart: string;
            rows: AsimData[];
            weekTotal: number;
        }[];
        monthTotal: number;
    }[];
    yearTotal: number;
}

const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const groupData = (data: AsimData[]): GroupedData[] => {
    const grouped: GroupedData[] = [];

    // Group by year
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);

    years.forEach(year => {
        const yearData = data.filter(d => d.year === year);
        const months: GroupedData['months'] = [];

        // Group by month
        const monthsInYear = [...new Set(yearData.map(d => d.monthNumber))].sort((a, b) => a - b);
        monthsInYear.forEach(monthNum => {
            const monthData = yearData.filter(d => d.monthNumber === monthNum);
            const weeks: GroupedData['months'][0]['weeks'] = [];

            // Group by week
            const weeksInMonth = [...new Set(monthData.map(d => d.weekStart))];
            weeksInMonth.forEach(weekStart => {
                const weekData = monthData.filter(d => d.weekStart === weekStart);
                const weekTotal = weekData.reduce((sum, d) => sum + d.adet, 0);
                weeks.push({
                    weekStart,
                    rows: weekData,
                    weekTotal
                });
            });

            const monthTotal = weeks.reduce((sum, w) => sum + w.weekTotal, 0);
            months.push({
                month: monthNames[monthNum - 1],
                monthNumber: monthNum,
                weeks,
                monthTotal
            });
        });

        const yearTotal = months.reduce((sum, m) => sum + m.monthTotal, 0);
        grouped.push({ year, months, yearTotal });
    });

    return grouped;
};

// Generate week options for a given year
const generateWeekOptions = (year: number): { value: string; label: string }[] => {
    const options: { value: string; label: string }[] = [];
    const startDate = new Date(year, 0, 1);

    // Find first Monday
    while (startDate.getDay() !== 1) {
        startDate.setDate(startDate.getDate() + 1);
    }

    while (startDate.getFullYear() <= year) {
        const day = String(startDate.getDate()).padStart(2, '0');
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const dateStr = `${day}.${month}.${year}`;
        options.push({ value: dateStr, label: dateStr });
        startDate.setDate(startDate.getDate() + 7);
        if (startDate.getFullYear() > year && startDate.getMonth() > 0) break;
    }

    return options;
};

const AsimListesiPage = () => {
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
    const [selectedProductType, setSelectedProductType] = useState<string>('all');
    const [selectedWeek, setSelectedWeek] = useState<string>('all');
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([2026]));
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set(['2026-Ocak', '2026-Şubat', '2026-Nisan', '2026-Mayıs']));
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const [columnFilters, setColumnFilters] = useState({
        client: '',
        kod: '',
        ilce: '',
        semt: '',
        adres: '',
        network: ''
    });

    const [asimData, setAsimData] = useState<AsimData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const weekOptions = useMemo(() => generateWeekOptions(selectedYear), [selectedYear]);
    const networks = ['1', '2', '3', 'BELEDİYE'];
    const productTypes = [
        { code: 'BB', name: 'Billboard' },
        { code: 'CLP', name: 'Raket' },
        { code: 'MGL', name: 'Megalight' },
        { code: 'GB', name: 'Giantboard' },
        { code: 'LB', name: 'LED' },
        { code: 'MB', name: 'Megaboard' },
        { code: 'KB', name: 'Kuleboard' }
    ];

    // Fetch real data from bookings
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookings, inventory] = await Promise.all([
                bookingsService.getAll(),
                inventoryService.getAll()
            ]);

            // Create inventory map for quick lookup
            const inventoryMap = new Map(inventory.map(item => [item.id, item]));

            // Only show confirmed (KESİN) bookings in Asım Listesi
            const confirmedBookings = bookings.filter(b => b.status === 'KESİN');

            // Transform bookings to AsimData format grouped by brand
            const brandGroups: Record<string, AsimData> = {};

            confirmedBookings.forEach(booking => {
                const invItem = inventoryMap.get(booking.inventory_item_id);
                if (!invItem) return;

                // Parse date from booking
                const startDate = booking.start_date;
                if (!startDate) return;

                // Helper function to get Monday of the week for any date
                const getMondayOfWeek = (dateStr: string): { weekStart: string; year: number; monthNum: number } => {
                    let date: Date;
                    if (dateStr.includes('.')) {
                        // Format: DD.MM.YYYY
                        const parts = dateStr.split('.');
                        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    } else if (dateStr.includes('-')) {
                        // Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
                        const cleanDate = dateStr.split('T')[0];
                        const parts = cleanDate.split('-');
                        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    } else {
                        return { weekStart: '', year: 0, monthNum: 0 };
                    }

                    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
                    const dayOfWeek = date.getDay();
                    // Calculate days to subtract to get to Monday
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    // Get Monday's date
                    const monday = new Date(date);
                    monday.setDate(date.getDate() - daysToMonday);

                    const day = String(monday.getDate()).padStart(2, '0');
                    const month = String(monday.getMonth() + 1).padStart(2, '0');
                    const mondayYear = monday.getFullYear();

                    return {
                        weekStart: `${day}.${month}.${mondayYear}`,
                        year: mondayYear,
                        monthNum: monday.getMonth() + 1
                    };
                };

                // Get the Monday of the week for this booking
                const { weekStart, year, monthNum } = getMondayOfWeek(startDate);
                if (!weekStart) return;

                // Get brand from booking
                const brand = booking.brand_option_1 || booking.brand_name || '(boş)';
                const network = invItem.network || '';

                // Create unique key for grouping - including inventory item ID to show each location
                const key = `${year}-${monthNum}-${weekStart}-${brand}-${network}-${invItem.id}`;

                if (!brandGroups[key]) {
                    brandGroups[key] = {
                        id: key,
                        year,
                        month: monthNames[monthNum - 1],
                        monthNumber: monthNum,
                        weekStart,
                        client: brand,
                        network,
                        adet: 1, // Since we are grouping by individual location now
                        kod: invItem.code,
                        ilce: invItem.district,
                        semt: invItem.neighborhood || '',
                        adres: invItem.address,
                        koordinat: invItem.coordinates || '',
                        routNo: String(invItem.routeNo || '-'),
                        type: invItem.type || ''
                    };
                }
            });

            setAsimData(Object.values(brandGroups));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data based on selections
    const filteredData = useMemo(() => {
        return asimData.filter(item => {
            const networkMatch = selectedNetwork === 'all' || item.network === selectedNetwork;
            const weekMatch = selectedWeek === 'all' || item.weekStart === selectedWeek;
            const productTypeMatch = selectedProductType === 'all' || item.type?.toUpperCase() === selectedProductType.toUpperCase();

            // Column filters
            const clientMatch = item.client.toLowerCase().includes(columnFilters.client.toLowerCase());
            const kodMatch = item.kod.toLowerCase().includes(columnFilters.kod.toLowerCase());
            const ilceMatch = item.ilce.toLowerCase().includes(columnFilters.ilce.toLowerCase());
            const semtMatch = item.semt.toLowerCase().includes(columnFilters.semt.toLowerCase());
            const adresMatch = item.adres.toLowerCase().includes(columnFilters.adres.toLowerCase());
            const netMatch = columnFilters.network === '' || String(item.network).includes(columnFilters.network);

            return networkMatch && weekMatch && productTypeMatch && clientMatch && kodMatch && ilceMatch && semtMatch && adresMatch && netMatch;
        });
    }, [asimData, selectedNetwork, selectedWeek, selectedProductType, columnFilters]);

    const groupedData = useMemo(() => groupData(filteredData), [filteredData]);

    const toggleYear = (year: number) => {
        const newExpanded = new Set(expandedYears);
        if (newExpanded.has(year)) {
            newExpanded.delete(year);
        } else {
            newExpanded.add(year);
        }
        setExpandedYears(newExpanded);
    };

    const toggleMonth = (yearMonth: string) => {
        const newExpanded = new Set(expandedMonths);
        if (newExpanded.has(yearMonth)) {
            newExpanded.delete(yearMonth);
        } else {
            newExpanded.add(yearMonth);
        }
        setExpandedMonths(newExpanded);
    };

    const toggleWeek = (weekKey: string) => {
        const newExpanded = new Set(expandedWeeks);
        if (newExpanded.has(weekKey)) {
            newExpanded.delete(weekKey);
        } else {
            newExpanded.add(weekKey);
        }
        setExpandedWeeks(newExpanded);
    };

    const toggleProduct = (productKey: string) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productKey)) {
            newExpanded.delete(productKey);
        } else {
            newExpanded.add(productKey);
        }
        setExpandedProducts(newExpanded);
    };

    const grandTotal = groupedData.reduce((sum, y) => sum + y.yearTotal, 0);

    // Group data by product type for Products tab
    const productGroupedData = useMemo(() => {
        const productGroups: Record<string, { type: string; name: string; rows: AsimData[]; total: number }> = {};

        filteredData.forEach(item => {
            const type = item.type?.toUpperCase() || 'DİĞER';
            const productName = productTypes.find(pt => pt.code === type)?.name || type;

            if (!productGroups[type]) {
                productGroups[type] = {
                    type,
                    name: productName,
                    rows: [],
                    total: 0
                };
            }
            productGroups[type].rows.push(item);
            productGroups[type].total += item.adet;
        });

        return Object.values(productGroups).sort((a, b) => b.total - a.total);
    }, [filteredData]);

    // Calculate summary statistics with detailed company breakdown
    const summaryStats = useMemo(() => {
        const uniqueClients = new Set(filteredData.map(d => d.client)).size;
        const uniqueNetworks = new Set(filteredData.map(d => d.network).filter(Boolean)).size;
        const uniqueDistricts = new Set(filteredData.map(d => d.ilce).filter(Boolean)).size;
        const uniqueWeeks = new Set(filteredData.map(d => d.weekStart)).size;
        const uniqueMonths = new Set(filteredData.map(d => `${d.year}-${d.monthNumber}`)).size;

        // Product type breakdown
        const productBreakdown: Record<string, number> = {};
        filteredData.forEach(item => {
            const type = item.type?.toUpperCase() || 'DİĞER';
            productBreakdown[type] = (productBreakdown[type] || 0) + item.adet;
        });

        // Network breakdown
        const networkBreakdown: Record<string, number> = {};
        filteredData.forEach(item => {
            const network = item.network || 'Belirtilmemiş';
            networkBreakdown[network] = (networkBreakdown[network] || 0) + item.adet;
        });

        // Detailed Company/Client breakdown with products, dates, networks
        interface ClientDetail {
            client: string;
            totalAdet: number;
            products: Record<string, number>;
            networks: Set<string>;
            districts: Set<string>;
            weekStarts: string[];
            dateRange: { start: string; end: string };
            locations: number;
        }

        const clientDetails: Record<string, ClientDetail> = {};

        filteredData.forEach(item => {
            const client = item.client || '(boş)';

            if (!clientDetails[client]) {
                clientDetails[client] = {
                    client,
                    totalAdet: 0,
                    products: {},
                    networks: new Set(),
                    districts: new Set(),
                    weekStarts: [],
                    dateRange: { start: '', end: '' },
                    locations: 0
                };
            }

            const detail = clientDetails[client];
            detail.totalAdet += item.adet;
            detail.locations += 1;

            // Products breakdown
            const productType = item.type?.toUpperCase() || 'DİĞER';
            detail.products[productType] = (detail.products[productType] || 0) + item.adet;

            // Networks
            if (item.network) {
                detail.networks.add(item.network);
            }

            // Districts
            if (item.ilce) {
                detail.districts.add(item.ilce);
            }

            // Week starts for date range
            if (item.weekStart) {
                detail.weekStarts.push(item.weekStart);
            }
        });

        // Calculate date ranges for each client
        Object.values(clientDetails).forEach(detail => {
            if (detail.weekStarts.length > 0) {
                // Parse dates and sort
                const parsedDates = detail.weekStarts.map(ws => {
                    const parts = ws.split('.');
                    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                }).sort((a, b) => a.getTime() - b.getTime());

                const formatDate = (d: Date) => {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    return `${day}.${month}.${d.getFullYear()}`;
                };

                detail.dateRange.start = formatDate(parsedDates[0]);
                detail.dateRange.end = formatDate(parsedDates[parsedDates.length - 1]);
            }
        });

        // Sort clients by total adet
        const sortedClientDetails = Object.values(clientDetails)
            .sort((a, b) => b.totalAdet - a.totalAdet);

        return {
            totalItems: grandTotal,
            uniqueClients,
            uniqueNetworks,
            uniqueDistricts,
            uniqueWeeks,
            uniqueMonths,
            productBreakdown,
            networkBreakdown,
            clientDetails: sortedClientDetails
        };
    }, [filteredData, grandTotal]);

    // Export to Excel
    const handleExportExcel = () => {
        const rows: any[] = [];

        groupedData.forEach(yearGroup => {
            // Year row
            rows.push({
                'Yıl': yearGroup.year,
                'Ay': '',
                'Hafta': '',
                'Müşteri / Marka': '',
                'Network': '',
                'Toplam': yearGroup.yearTotal
            });

            yearGroup.months.forEach(monthGroup => {
                // Month row
                rows.push({
                    'Yıl': '',
                    'Ay': monthGroup.month,
                    'Hafta': '',
                    'Müşteri / Marka': '',
                    'Network': '',
                    'Toplam': monthGroup.monthTotal
                });

                monthGroup.weeks.forEach(weekGroup => {
                    // Week total row
                    rows.push({
                        'Yıl': '',
                        'Ay': '',
                        'Hafta': weekGroup.weekStart,
                        'Müşteri / Marka': 'HAFTA TOPLAMI',
                        'Koordinat': '',
                        'İlçe': '',
                        'Semt': '',
                        'Adres': '',
                        'Kod': '',
                        'Network': '',
                        'Rout No': '',
                        'Toplam': weekGroup.weekTotal
                    });

                    // Week data rows
                    weekGroup.rows.forEach(row => {
                        rows.push({
                            'Yıl': '',
                            'Ay': '',
                            'Hafta': weekGroup.weekStart,
                            'Müşteri / Marka': row.client === '(boş)' ? '-' : row.client,
                            'Koordinat': row.koordinat,
                            'İlçe': row.ilce,
                            'Semt': row.semt,
                            'Adres': row.adres,
                            'Kod': row.kod,
                            'Network': row.network || '-',
                            'Rout No': row.routNo,
                            'Toplam': row.adet
                        });
                    });
                });
            });
        });

        // Add Grand Total
        if (rows.length > 0) {
            rows.push({
                'Yıl': 'GENEL TOPLAM',
                'Ay': '',
                'Hafta': '',
                'Müşteri / Marka': '',
                'Network': '',
                'Toplam': grandTotal
            });
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Asım Listesi');

        // Column widths
        const wscols = [
            { wch: 10 }, // Yıl
            { wch: 15 }, // Ay
            { wch: 15 }, // Hafta
            { wch: 30 }, // Müşteri / Marka
            { wch: 20 }, // Koordinat
            { wch: 15 }, // İlçe
            { wch: 15 }, // Semt
            { wch: 40 }, // Adres
            { wch: 10 }, // Kod
            { wch: 10 }, // Network
            { wch: 10 }, // Rout No
            { wch: 10 }, // Toplam
        ];
        worksheet['!cols'] = wscols;

        // Generate filename
        const filename = `asim_listesi_${selectedYear}_network_${selectedNetwork}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl text-white">
                            <Calendar className="w-6 h-6" />
                        </div>
                        Asım Listesi
                    </h1>
                    <p className="text-gray-500 mt-1">Rezervasyon verilerinden oluşturulmuş asım listesi</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSummaryModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Özet Liste</span>
                    </button>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Yenile</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Excel İndir</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-4">
                <Filter className="w-4 h-4 text-gray-400" />

                {/* Year Navigation */}
                <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                    <button
                        onClick={() => setSelectedYear(y => y - 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-gray-700 min-w-[60px] text-center">{selectedYear}</span>
                    <button
                        onClick={() => setSelectedYear(y => y + 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Week Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Hafta:</label>
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">Tüm Haftalar</option>
                        {weekOptions.map(w => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                    </select>
                </div>

                {/* Network Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Network:</label>
                    <select
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">Tüm Networkler</option>
                        {networks.map(n => (
                            <option key={n} value={n}>Network {n}</option>
                        ))}
                    </select>
                </div>

                {/* Product Type Filter */}
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    <label className="text-sm text-gray-600 text-nowrap">Ürün Tipi:</label>
                    <select
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">Tüm Ürünler</option>
                        {productTypes.map(pt => (
                            <option key={pt.code} value={pt.code}>{pt.name} ({pt.code})</option>
                        ))}
                    </select>
                </div>

                {/* Active Filter Badge */}
                {(selectedNetwork !== 'all' || selectedWeek !== 'all' || selectedProductType !== 'all') && (
                    <div className="flex items-center gap-2">
                        {selectedNetwork !== 'all' && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                Network: {selectedNetwork}
                            </span>
                        )}
                        {selectedProductType !== 'all' && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                Ürün: {selectedProductType}
                            </span>
                        )}
                        {selectedWeek !== 'all' && (
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                                Hafta: {selectedWeek}
                            </span>
                        )}
                        <button
                            onClick={() => { setSelectedNetwork('all'); setSelectedWeek('all'); setSelectedProductType('all'); }}
                            className="text-gray-400 hover:text-gray-600 text-xs underline"
                        >
                            Temizle
                        </button>
                    </div>
                )}
            </div>

            {/* Excel-style Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Veriler yükleniyor...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            {/* Header Row */}
                            <thead>
                                <tr className="bg-gradient-to-r from-primary-700 to-secondary-700 text-white">
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600 w-20">Yıl</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600 w-24">Ay</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600 w-32">Hafta</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600 min-w-[150px]">Müşteri / Marka</th>
                                    <th className="px-3 py-3 text-center font-semibold border-r border-primary-600 w-24">Ürün Tipi</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600">Koordinat</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600">İlçe</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600">Semt</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600 min-w-[200px]">Adres</th>
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600">Kod</th>
                                    <th className="px-3 py-3 text-center font-semibold border-r border-primary-600 w-24">Network</th>
                                    <th className="px-3 py-3 text-center font-semibold border-r border-primary-600">Rout No</th>
                                    <th className="px-3 py-3 text-center font-semibold w-24 bg-primary-800">Toplam</th>
                                </tr>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="px-1 py-1 border-r border-gray-100"></th>
                                    <th className="px-1 py-1 border-r border-gray-100"></th>
                                    <th className="px-1 py-1 border-r border-gray-100"></th>
                                    <th className="px-1 py-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            placeholder="Filtrele..."
                                            value={columnFilters.client}
                                            onChange={(e) => setColumnFilters({ ...columnFilters, client: e.target.value })}
                                        />
                                    </th>
                                    <th className="px-1 py-1 border-r border-gray-100"></th>
                                    <th className="px-1 py-1 border-r border-gray-100"></th>
                                    <th className="px-1 py-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            placeholder="Filtrele..."
                                            value={columnFilters.ilce}
                                            onChange={(e) => setColumnFilters({ ...columnFilters, ilce: e.target.value })}
                                        />
                                    </th>
                                    <th className="px-1 py-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            placeholder="Filtrele..."
                                            value={columnFilters.semt}
                                            onChange={(e) => setColumnFilters({ ...columnFilters, semt: e.target.value })}
                                        />
                                    </th>
                                    <th className="px-1 py-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            placeholder="Filtrele..."
                                            value={columnFilters.adres}
                                            onChange={(e) => setColumnFilters({ ...columnFilters, adres: e.target.value })}
                                        />
                                    </th>
                                    <th className="px-1 py-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            placeholder="Filtrele..."
                                            value={columnFilters.kod}
                                            onChange={(e) => setColumnFilters({ ...columnFilters, kod: e.target.value })}
                                        />
                                    </th>
                                    <th className="px-1 py-1 border-r border-gray-100">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            placeholder="Fil..."
                                            value={columnFilters.network}
                                            onChange={(e) => setColumnFilters({ ...columnFilters, network: e.target.value })}
                                        />
                                    </th>
                                    <th className="px-1 py-1 border-r border-gray-100"></th>
                                    <th className="px-1 py-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-4 py-12 text-center text-gray-500">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="font-medium">Veri bulunamadı</p>
                                            <p className="text-sm mt-1">Seçili filtrelere uygun rezervasyon bulunmuyor</p>
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map((yearGroup) => (
                                        <>
                                            {/* Year Row */}
                                            <tr
                                                key={`year-${yearGroup.year}`}
                                                className="bg-blue-50 hover:bg-blue-100 cursor-pointer border-t-2 border-blue-300"
                                                onClick={() => toggleYear(yearGroup.year)}
                                            >
                                                <td className="px-3 py-2 font-bold text-blue-800 border-r border-gray-200">
                                                    <div className="flex items-center gap-1">
                                                        {expandedYears.has(yearGroup.year) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                                        {yearGroup.year}
                                                    </div>
                                                </td>
                                                <td colSpan={11} className="px-3 py-2 font-semibold text-blue-700 border-r border-gray-200"></td>
                                                <td className="px-3 py-2 text-center font-bold text-blue-800 bg-blue-100">{yearGroup.yearTotal}</td>
                                            </tr>

                                            {expandedYears.has(yearGroup.year) && yearGroup.months.map((monthGroup) => (
                                                <>
                                                    {/* Month Row */}
                                                    <tr
                                                        key={`month-${yearGroup.year}-${monthGroup.month}`}
                                                        className="bg-purple-50 hover:bg-purple-100 cursor-pointer"
                                                        onClick={() => toggleMonth(`${yearGroup.year}-${monthGroup.month}`)}
                                                    >
                                                        <td className="px-3 py-2 border-r border-gray-200"></td>
                                                        <td className="px-3 py-2 font-semibold text-purple-700 border-r border-gray-200">
                                                            <div className="flex items-center gap-1">
                                                                {expandedMonths.has(`${yearGroup.year}-${monthGroup.month}`) ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                                                                {monthGroup.month}
                                                            </div>
                                                        </td>
                                                        <td colSpan={10} className="px-3 py-2 border-r border-gray-200"></td>
                                                        <td className="px-3 py-2 text-center font-semibold text-purple-700 bg-purple-100">{monthGroup.monthTotal}</td>
                                                    </tr>

                                                    {expandedMonths.has(`${yearGroup.year}-${monthGroup.month}`) && monthGroup.weeks.map((weekGroup) => {
                                                        const weekKey = `${yearGroup.year}-${monthGroup.month}-${weekGroup.weekStart}`;
                                                        return (
                                                            <>
                                                                {/* Week Total Row - Clickable */}
                                                                <tr
                                                                    key={`week-total-${weekGroup.weekStart}`}
                                                                    className="bg-amber-50 hover:bg-amber-100 cursor-pointer text-amber-800"
                                                                    onClick={() => toggleWeek(weekKey)}
                                                                >
                                                                    <td className="px-3 py-2 border-r border-gray-200"></td>
                                                                    <td className="px-3 py-2 border-r border-gray-200"></td>
                                                                    <td className="px-3 py-2 border-r border-gray-200 font-medium">
                                                                        <div className="flex items-center gap-1">
                                                                            {expandedWeeks.has(weekKey) ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                                                                            {weekGroup.weekStart}
                                                                        </div>
                                                                    </td>
                                                                    <td colSpan={9} className="px-3 py-2 border-r border-gray-200"></td>
                                                                    <td className="px-3 py-2 text-center font-bold bg-amber-100">{weekGroup.weekTotal}</td>
                                                                </tr>

                                                                {/* Data Rows - Only show when week is expanded */}
                                                                {expandedWeeks.has(weekKey) && weekGroup.rows.map((row, rIdx) => (
                                                                    <tr
                                                                        key={row.id}
                                                                        className={`hover:bg-blue-50 transition-colors ${rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                                    >
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-400"></td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-400"></td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-500 text-xs pl-8">
                                                                            {rIdx === 0 ? weekGroup.weekStart : ''}
                                                                        </td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 font-medium">
                                                                            {row.client === '(boş)' ? (
                                                                                <span className="text-gray-400 italic">(boş)</span>
                                                                            ) : (
                                                                                <span className="text-primary-700">{row.client}</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-r border-gray-200">
                                                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{row.type || '-'}</span>
                                                                        </td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-600 text-[10px]">{row.koordinat}</td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-600">{row.ilce}</td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-600">{row.semt}</td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 text-gray-600 text-xs max-w-xs truncate" title={row.adres}>{row.adres}</td>
                                                                        <td className="px-3 py-2 border-r border-gray-200 font-bold text-gray-700">{row.kod}</td>
                                                                        <td className="px-3 py-2 text-center border-r border-gray-200">
                                                                            {row.network ? (
                                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                                                    {row.network}
                                                                                </span>
                                                                            ) : '-'}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center border-r border-gray-200 font-bold text-primary-600">{row.routNo}</td>
                                                                        <td className="px-3 py-2 text-center font-bold bg-yellow-50 text-yellow-800">
                                                                            {row.adet}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </>
                                                        );
                                                    })}
                                                </>
                                            ))}
                                        </>
                                    ))
                                )}

                                {/* Grand Total Row */}
                                {groupedData.length > 0 && (
                                    <tr className="bg-gradient-to-r from-primary-800 to-secondary-800 text-white font-bold border-t-2 border-primary-600">
                                        <td colSpan={12} className="px-4 py-3 text-left">
                                            Genel Toplam
                                        </td>
                                        <td className="px-4 py-3 text-center text-lg bg-yellow-500 text-yellow-900">
                                            {grandTotal}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Açıklamalar</h3>
                <div className="flex flex-wrap gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></span>
                        <span className="text-gray-600">Yıl Satırı</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></span>
                        <span className="text-gray-600">Ay Satırı</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></span>
                        <span className="text-gray-600">Hafta Toplamı</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded"></span>
                        <span className="text-gray-600">Toplam Adet</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">1</span>
                        <span className="text-gray-600">= Network Numarası</span>
                    </div>
                </div>
            </div>

            {/* Summary Modal */}
            {showSummaryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8" />
                                <div>
                                    <h2 className="text-xl font-bold">Özet Rapor</h2>
                                    <p className="text-green-100 text-sm">Asım Listesi Genel Özeti</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-blue-700">{summaryStats.totalItems}</div>
                                    <div className="text-sm text-blue-600">Toplam Adet</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-purple-700">{summaryStats.uniqueClients}</div>
                                    <div className="text-sm text-purple-600">Firma</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-green-700">{summaryStats.uniqueNetworks}</div>
                                    <div className="text-sm text-green-600">Network</div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-amber-700">{summaryStats.uniqueDistricts}</div>
                                    <div className="text-sm text-amber-600">İlçe</div>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-pink-700">{summaryStats.uniqueWeeks}</div>
                                    <div className="text-sm text-pink-600">Hafta</div>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-indigo-700">{summaryStats.uniqueMonths}</div>
                                    <div className="text-sm text-indigo-600">Ay</div>
                                </div>
                            </div>

                            {/* Detailed Company Table */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-lg">
                                    <FileText className="w-5 h-5" />
                                    Firma Bazlı Asım Durumu
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                                <th className="px-3 py-3 text-left font-semibold border-r border-gray-600">#</th>
                                                <th className="px-3 py-3 text-left font-semibold border-r border-gray-600 min-w-[180px]">Firma / Marka</th>
                                                <th className="px-3 py-3 text-left font-semibold border-r border-gray-600 min-w-[200px]">Ürünler</th>
                                                <th className="px-3 py-3 text-center font-semibold border-r border-gray-600">Toplam Adet</th>
                                                <th className="px-3 py-3 text-center font-semibold border-r border-gray-600">Lokasyon</th>
                                                <th className="px-3 py-3 text-left font-semibold border-r border-gray-600 min-w-[180px]">Asım Tarihleri</th>
                                                <th className="px-3 py-3 text-left font-semibold border-r border-gray-600">Networkler</th>
                                                <th className="px-3 py-3 text-left font-semibold">İlçeler</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryStats.clientDetails.map((detail, index) => (
                                                <tr
                                                    key={detail.client}
                                                    className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                >
                                                    <td className="px-3 py-3 border-r border-gray-200 text-gray-500 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200">
                                                        <div className="font-semibold text-gray-800">
                                                            {detail.client === '(boş)' ? (
                                                                <span className="text-gray-400 italic">Belirtilmemiş</span>
                                                            ) : detail.client}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(detail.products)
                                                                .sort((a, b) => b[1] - a[1])
                                                                .map(([type, count]) => {
                                                                    const productName = productTypes.find(pt => pt.code === type)?.name || type;
                                                                    return (
                                                                        <span
                                                                            key={type}
                                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                                                                            title={productName}
                                                                        >
                                                                            {type}: <span className="font-bold">{count}</span>
                                                                        </span>
                                                                    );
                                                                })}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center">
                                                        <span className="inline-flex items-center justify-center w-10 h-10 bg-yellow-100 text-yellow-800 rounded-full font-bold text-lg">
                                                            {detail.totalAdet}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200 text-center">
                                                        <span className="text-gray-600 font-medium">{detail.locations}</span>
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200">
                                                        {detail.dateRange.start ? (
                                                            <div className="text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-500">Başlangıç:</span>
                                                                    <span className="font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">{detail.dateRange.start}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-gray-500">Bitiş:</span>
                                                                    <span className="font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded">{detail.dateRange.end}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 border-r border-gray-200">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Array.from(detail.networks).map(network => (
                                                                <span
                                                                    key={network}
                                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                                                >
                                                                    {network}
                                                                </span>
                                                            ))}
                                                            {detail.networks.size === 0 && <span className="text-gray-400">-</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {Array.from(detail.districts).slice(0, 3).map(district => (
                                                                <span
                                                                    key={district}
                                                                    className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium"
                                                                >
                                                                    {district}
                                                                </span>
                                                            ))}
                                                            {detail.districts.size > 3 && (
                                                                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                                                                    +{detail.districts.size - 3} daha
                                                                </span>
                                                            )}
                                                            {detail.districts.size === 0 && <span className="text-gray-400">-</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold">
                                                <td colSpan={3} className="px-3 py-3 text-right">
                                                    GENEL TOPLAM
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 text-yellow-900 rounded-full font-bold text-xl">
                                                        {summaryStats.totalItems}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {summaryStats.clientDetails.reduce((sum, d) => sum + d.locations, 0)}
                                                </td>
                                                <td colSpan={3} className="px-3 py-3">
                                                    <span className="text-gray-300">
                                                        {summaryStats.uniqueClients} firma • {summaryStats.uniqueNetworks} network • {summaryStats.uniqueDistricts} ilçe
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Product & Network Summary Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {/* Product Breakdown */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Ürün Tipi Özeti
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(summaryStats.productBreakdown)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([type, count]) => {
                                                const productName = productTypes.find(pt => pt.code === type)?.name || type;
                                                const percentage = ((count / summaryStats.totalItems) * 100).toFixed(1);
                                                return (
                                                    <div key={type} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">{type}</span>
                                                            <span className="text-sm text-gray-600">{productName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary-500 rounded-full"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right">{count}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Network Breakdown */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        Network Özeti
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(summaryStats.networkBreakdown)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([network, count]) => {
                                                const percentage = ((count / summaryStats.totalItems) * 100).toFixed(1);
                                                return (
                                                    <div key={network} className="flex items-center justify-between">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                            Network {network}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500 rounded-full"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right">{count}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsimListesiPage;
