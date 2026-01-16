import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    ChevronDown,
    ChevronUp,
    Filter,
    RefreshCw
} from 'lucide-react';
import { bookingsService, inventoryService } from '../services';

interface AsimData {
    id: string;
    year: number;
    month: string;
    monthNumber: number;
    weekStart: string;
    client: string;
    network: string;
    adet: number;
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
    const [selectedWeek, setSelectedWeek] = useState<string>('all');
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([2026]));
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set(['2026-Ocak', '2026-Şubat', '2026-Nisan', '2026-Mayıs']));
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

    const [asimData, setAsimData] = useState<AsimData[]>([]);
    const [loading, setLoading] = useState(true);

    const weekOptions = useMemo(() => generateWeekOptions(selectedYear), [selectedYear]);
    const networks = ['1', '2', '3', 'BELEDİYE'];

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

                // Create unique key for grouping
                const key = `${year}-${monthNum}-${weekStart}-${brand}-${network}`;

                if (!brandGroups[key]) {
                    brandGroups[key] = {
                        id: key,
                        year,
                        month: monthNames[monthNum - 1],
                        monthNumber: monthNum,
                        weekStart,
                        client: brand,
                        network,
                        adet: 0
                    };
                }
                brandGroups[key].adet += 1;
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
            return networkMatch && weekMatch;
        });
    }, [asimData, selectedNetwork, selectedWeek]);

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

    const grandTotal = groupedData.reduce((sum, y) => sum + y.yearTotal, 0);

    // Export to Excel
    const handleExportExcel = () => {
        const csvContent = [
            ['Yıl', 'Ay', 'Hafta', 'Müşteri/Marka', 'Network', 'Adet'].join('\t'),
            ...filteredData.map(item =>
                [item.year, item.month, item.weekStart, item.client, item.network, item.adet].join('\t')
            )
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `asim_listesi_${selectedYear}_network_${selectedNetwork}.csv`;
        link.click();
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

                {/* Active Filter Badge */}
                {(selectedNetwork !== 'all' || selectedWeek !== 'all') && (
                    <div className="flex items-center gap-2">
                        {selectedNetwork !== 'all' && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                Network: {selectedNetwork}
                            </span>
                        )}
                        {selectedWeek !== 'all' && (
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                                Hafta: {selectedWeek}
                            </span>
                        )}
                        <button
                            onClick={() => { setSelectedNetwork('all'); setSelectedWeek('all'); }}
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
                                    <th className="px-3 py-3 text-left font-semibold border-r border-primary-600 min-w-[200px]">Müşteri / Marka</th>
                                    <th className="px-3 py-3 text-center font-semibold border-r border-primary-600 w-24">Network</th>
                                    <th className="px-3 py-3 text-center font-semibold w-24 bg-primary-800">Toplam</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
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
                                                <td colSpan={4} className="px-3 py-2 font-semibold text-blue-700 border-r border-gray-200"></td>
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
                                                        <td colSpan={3} className="px-3 py-2 border-r border-gray-200"></td>
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
                                                                    <td className="px-3 py-2 border-r border-gray-200"></td>
                                                                    <td className="px-3 py-2 text-center border-r border-gray-200"></td>
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
                                                                            {row.network ? (
                                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                                                    {row.network}
                                                                                </span>
                                                                            ) : '-'}
                                                                        </td>
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
                                        <td colSpan={5} className="px-4 py-3 text-left">
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
        </div>
    );
};

export default AsimListesiPage;
