import { useState, useMemo } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Plus,
    ChevronDown,
    ChevronUp,
    Filter
} from 'lucide-react';

interface AsimData {
    id: string;
    year: number;
    month: string;
    monthNumber: number;
    weekStart: string;
    weekEnd: string;
    client: string;
    marka1Opsiyon: string;
    marka1Adet: number;
    marka2Opsiyon: string;
    marka2Adet: number;
    marka3Opsiyon: string;
    marka3Adet: number;
    marka4Opsiyon: string;
    marka4Adet: number;
    network: string;
    networkAdet: number;
    genelToplam: number;
}

// Sample data based on the Excel screenshot
const generateSampleData = (): AsimData[] => {
    const data: AsimData[] = [
        // 2025 - Kasım
        { id: '1', year: 2025, month: 'Kasım', monthNumber: 11, weekStart: '17.11.2025', weekEnd: '23.11.2025', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 12, genelToplam: 20 },
        { id: '2', year: 2025, month: 'Kasım', monthNumber: 11, weekStart: '17.11.2025', weekEnd: '23.11.2025', client: 'SUSHTTO', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 8, genelToplam: 18 },
        { id: '3', year: 2025, month: 'Kasım', monthNumber: 11, weekStart: '24.11.2025', weekEnd: '30.11.2025', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 12, genelToplam: 20 },
        { id: '4', year: 2025, month: 'Kasım', monthNumber: 11, weekStart: '24.11.2025', weekEnd: '30.11.2025', client: 'SUSHTTO', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 8, genelToplam: 18 },
        // 2025 - Aralık  
        { id: '5', year: 2025, month: 'Aralık', monthNumber: 12, weekStart: '01.12.2025', weekEnd: '07.12.2025', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 2, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 24 },
        // 2026 - Ocak
        { id: '6', year: 2026, month: 'Ocak', monthNumber: 1, weekStart: '05.01.2026', weekEnd: '11.01.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 20 },
        { id: '7', year: 2026, month: 'Ocak', monthNumber: 1, weekStart: '05.01.2026', weekEnd: '11.01.2026', client: '(boş)', marka1Opsiyon: '(boş)', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 24 },
        { id: '8', year: 2026, month: 'Ocak', monthNumber: 1, weekStart: '12.01.2026', weekEnd: '18.01.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 24 },
        { id: '9', year: 2026, month: 'Ocak', monthNumber: 1, weekStart: '12.01.2026', weekEnd: '18.01.2026', client: 'KARŞIYAKA KOLEJİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 24 },
        { id: '10', year: 2026, month: 'Ocak', monthNumber: 1, weekStart: '19.01.2026', weekEnd: '25.01.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 24 },
        { id: '11', year: 2026, month: 'Ocak', monthNumber: 1, weekStart: '26.01.2026', weekEnd: '01.02.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 60 },
        // 2026 - Şubat
        { id: '12', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '02.02.2026', weekEnd: '08.02.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 20 },
        { id: '13', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '02.02.2026', weekEnd: '08.02.2026', client: '(boş)', marka1Opsiyon: '(boş)', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 40 },
        { id: '14', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '02.02.2026', weekEnd: '08.02.2026', client: 'KENT KOLEJİ', marka1Opsiyon: '(boş)', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 20 },
        { id: '15', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '09.02.2026', weekEnd: '15.02.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 40 },
        { id: '16', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '09.02.2026', weekEnd: '15.02.2026', client: 'KENT KOLEJİ', marka1Opsiyon: '(boş)', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 24 },
        { id: '17', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '16.02.2026', weekEnd: '22.02.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 48 },
        { id: '18', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '16.02.2026', weekEnd: '22.02.2026', client: 'KENT KOLEJİ', marka1Opsiyon: '(boş)', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 20 },
        { id: '19', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '23.02.2026', weekEnd: '01.03.2026', client: 'KARŞIYAKA BELEDİYESİ', marka1Opsiyon: '', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 20, genelToplam: 20 },
        { id: '20', year: 2026, month: 'Şubat', monthNumber: 2, weekStart: '23.02.2026', weekEnd: '01.03.2026', client: 'KENT KOLEJİ', marka1Opsiyon: '(boş)', marka1Adet: 0, marka2Opsiyon: '(boş)', marka2Adet: 0, marka3Opsiyon: '(boş)', marka3Adet: 0, marka4Opsiyon: '(boş)', marka4Adet: 0, network: '', networkAdet: 0, genelToplam: 24 },
    ];
    return data;
};

// Group data hierarchically
interface GroupedData {
    year: number;
    months: {
        month: string;
        monthNumber: number;
        weeks: {
            weekStart: string;
            weekEnd: string;
            rows: AsimData[];
            weekTotal: number;
        }[];
        monthTotal: number;
    }[];
    yearTotal: number;
}

const groupData = (data: AsimData[]): GroupedData[] => {
    const grouped: GroupedData[] = [];

    // Group by year
    const years = [...new Set(data.map(d => d.year))];

    years.forEach(year => {
        const yearData = data.filter(d => d.year === year);
        const months: GroupedData['months'] = [];

        // Group by month
        const monthsInYear = [...new Set(yearData.map(d => d.month))];
        monthsInYear.forEach(month => {
            const monthData = yearData.filter(d => d.month === month);
            const weeks: GroupedData['months'][0]['weeks'] = [];

            // Group by week
            const weeksInMonth = [...new Set(monthData.map(d => d.weekStart))];
            weeksInMonth.forEach(weekStart => {
                const weekData = monthData.filter(d => d.weekStart === weekStart);
                const weekTotal = weekData.reduce((sum, d) => sum + d.genelToplam, 0);
                weeks.push({
                    weekStart,
                    weekEnd: weekData[0]?.weekEnd || '',
                    rows: weekData,
                    weekTotal
                });
            });

            const monthTotal = weeks.reduce((sum, w) => sum + w.weekTotal, 0);
            months.push({
                month,
                monthNumber: monthData[0]?.monthNumber || 0,
                weeks,
                monthTotal
            });
        });

        const yearTotal = months.reduce((sum, m) => sum + m.monthTotal, 0);
        grouped.push({ year, months, yearTotal });
    });

    return grouped;
};

const AsimListesiPage = () => {
    const [currentYear, setCurrentYear] = useState(2026);
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([2025, 2026]));
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set(['2025-Kasım', '2025-Aralık', '2026-Ocak', '2026-Şubat']));
    const [selectedNetwork, setSelectedNetwork] = useState<string>('all');

    const rawData = useMemo(() => generateSampleData(), []);
    const groupedData = useMemo(() => groupData(rawData), [rawData]);

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

    const grandTotal = groupedData.reduce((sum, y) => sum + y.yearTotal, 0);

    const networks = ['Network 1', 'Network 2', 'Network 3'];

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
                    <p className="text-gray-500 mt-1">Excel formatında rezervasyon takibi</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Excel İndir</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25">
                        <Plus className="w-4 h-4" />
                        <span>Yeni Asım</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="all">Tüm Networkler</option>
                    {networks.map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentYear(y => y - 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-gray-700 min-w-[60px] text-center">{currentYear}</span>
                    <button
                        onClick={() => setCurrentYear(y => y + 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Excel-style Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        {/* Header Row */}
                        <thead>
                            <tr className="bg-gradient-to-r from-primary-700 to-secondary-700 text-white">
                                <th className="px-2 py-3 text-left font-semibold border-r border-primary-600 w-16">Yıl</th>
                                <th className="px-2 py-3 text-left font-semibold border-r border-primary-600 w-20">Ay</th>
                                <th className="px-2 py-3 text-left font-semibold border-r border-primary-600 w-32">Hafta</th>
                                <th className="px-2 py-3 text-left font-semibold border-r border-primary-600 min-w-[180px]">Müşteri / Marka</th>
                                <th className="px-2 py-3 text-center font-semibold border-r border-primary-600 w-24">Marka 1<br /><span className="font-normal text-xs">Opsiyon</span></th>
                                <th className="px-2 py-3 text-center font-semibold border-r border-primary-600 w-24">Marka 2<br /><span className="font-normal text-xs">Opsiyon</span></th>
                                <th className="px-2 py-3 text-center font-semibold border-r border-primary-600 w-24">Marka 3<br /><span className="font-normal text-xs">Opsiyon</span></th>
                                <th className="px-2 py-3 text-center font-semibold border-r border-primary-600 w-24">Marka 4<br /><span className="font-normal text-xs">Opsiyon</span></th>
                                <th className="px-2 py-3 text-center font-semibold border-r border-primary-600 w-20">Network</th>
                                <th className="px-2 py-3 text-center font-semibold w-24 bg-primary-800">Genel<br />Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedData.map((yearGroup, yIdx) => (
                                <>
                                    {/* Year Row */}
                                    <tr
                                        key={`year-${yearGroup.year}`}
                                        className="bg-blue-50 hover:bg-blue-100 cursor-pointer border-t-2 border-blue-300"
                                        onClick={() => toggleYear(yearGroup.year)}
                                    >
                                        <td className="px-2 py-2 font-bold text-blue-800 border-r border-gray-200 flex items-center gap-1">
                                            {expandedYears.has(yearGroup.year) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                            {yearGroup.year}
                                        </td>
                                        <td colSpan={8} className="px-2 py-2 font-semibold text-blue-700 border-r border-gray-200"></td>
                                        <td className="px-2 py-2 text-center font-bold text-blue-800 bg-blue-100">{yearGroup.yearTotal}</td>
                                    </tr>

                                    {expandedYears.has(yearGroup.year) && yearGroup.months.map((monthGroup, mIdx) => (
                                        <>
                                            {/* Month Row */}
                                            <tr
                                                key={`month-${yearGroup.year}-${monthGroup.month}`}
                                                className="bg-purple-50 hover:bg-purple-100 cursor-pointer"
                                                onClick={() => toggleMonth(`${yearGroup.year}-${monthGroup.month}`)}
                                            >
                                                <td className="px-2 py-2 border-r border-gray-200"></td>
                                                <td className="px-2 py-2 font-semibold text-purple-700 border-r border-gray-200 flex items-center gap-1">
                                                    {expandedMonths.has(`${yearGroup.year}-${monthGroup.month}`) ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                                                    {monthGroup.month}
                                                </td>
                                                <td colSpan={7} className="px-2 py-2 border-r border-gray-200"></td>
                                                <td className="px-2 py-2 text-center font-semibold text-purple-700 bg-purple-100">{monthGroup.monthTotal}</td>
                                            </tr>

                                            {expandedMonths.has(`${yearGroup.year}-${monthGroup.month}`) && monthGroup.weeks.map((weekGroup, wIdx) => (
                                                <>
                                                    {/* Week Total Row */}
                                                    <tr key={`week-total-${weekGroup.weekStart}`} className="bg-gray-100 text-gray-600 text-xs">
                                                        <td className="px-2 py-1 border-r border-gray-200"></td>
                                                        <td className="px-2 py-1 border-r border-gray-200"></td>
                                                        <td className="px-2 py-1 border-r border-gray-200 font-medium">
                                                            Toplam {weekGroup.weekStart.split('.').slice(0, 2).join('.')}
                                                        </td>
                                                        <td className="px-2 py-1 border-r border-gray-200"></td>
                                                        <td className="px-2 py-1 text-center border-r border-gray-200">20</td>
                                                        <td className="px-2 py-1 text-center border-r border-gray-200">20</td>
                                                        <td className="px-2 py-1 text-center border-r border-gray-200">20</td>
                                                        <td className="px-2 py-1 text-center border-r border-gray-200">24</td>
                                                        <td className="px-2 py-1 text-center border-r border-gray-200 font-medium">84</td>
                                                        <td className="px-2 py-1 text-center font-bold bg-gray-200">{weekGroup.weekTotal}</td>
                                                    </tr>

                                                    {/* Data Rows */}
                                                    {weekGroup.rows.map((row, rIdx) => (
                                                        <tr
                                                            key={row.id}
                                                            className={`hover:bg-blue-50 transition-colors ${rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                        >
                                                            <td className="px-2 py-2 border-r border-gray-200 text-gray-400"></td>
                                                            <td className="px-2 py-2 border-r border-gray-200 text-gray-400"></td>
                                                            <td className="px-2 py-2 border-r border-gray-200 text-gray-500 text-xs">
                                                                {rIdx === 0 ? weekGroup.weekStart : ''}
                                                            </td>
                                                            <td className="px-2 py-2 border-r border-gray-200 font-medium text-gray-800">
                                                                {row.client === '(boş)' ? (
                                                                    <span className="text-gray-400 italic">(boş)</span>
                                                                ) : (
                                                                    <span className="text-primary-700">{row.client}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-2 text-center border-r border-gray-200">
                                                                {row.marka1Opsiyon === '(boş)' ? (
                                                                    <span className="text-gray-400 text-xs">(boş)</span>
                                                                ) : row.marka1Adet > 0 ? (
                                                                    <span className="font-medium">{row.marka1Adet}</span>
                                                                ) : ''}
                                                            </td>
                                                            <td className="px-2 py-2 text-center border-r border-gray-200">
                                                                {row.marka2Opsiyon === '(boş)' ? (
                                                                    <span className="text-gray-400 text-xs">(boş)</span>
                                                                ) : row.marka2Adet > 0 ? (
                                                                    <span className="font-medium">{row.marka2Adet}</span>
                                                                ) : ''}
                                                            </td>
                                                            <td className="px-2 py-2 text-center border-r border-gray-200">
                                                                {row.marka3Opsiyon === '(boş)' ? (
                                                                    <span className="text-gray-400 text-xs">(boş)</span>
                                                                ) : row.marka3Adet > 0 ? (
                                                                    <span className="font-medium">{row.marka3Adet}</span>
                                                                ) : ''}
                                                            </td>
                                                            <td className="px-2 py-2 text-center border-r border-gray-200">
                                                                {row.marka4Opsiyon === '(boş)' ? (
                                                                    <span className="text-gray-400 text-xs">(boş)</span>
                                                                ) : row.marka4Adet > 0 ? (
                                                                    <span className="font-medium">{row.marka4Adet}</span>
                                                                ) : ''}
                                                            </td>
                                                            <td className="px-2 py-2 text-center border-r border-gray-200 font-medium text-blue-600">
                                                                {row.networkAdet > 0 ? row.networkAdet : ''}
                                                            </td>
                                                            <td className="px-2 py-2 text-center font-bold bg-yellow-50 text-yellow-800">
                                                                {row.genelToplam}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            ))}
                                        </>
                                    ))}
                                </>
                            ))}

                            {/* Grand Total Row */}
                            <tr className="bg-gradient-to-r from-primary-800 to-secondary-800 text-white font-bold border-t-2 border-primary-600">
                                <td colSpan={9} className="px-4 py-3 text-left">
                                    Genel Toplam
                                </td>
                                <td className="px-4 py-3 text-center text-lg bg-yellow-500 text-yellow-900">
                                    {grandTotal}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
                        <span className="text-gray-600">Genel Toplam</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 italic">(boş)</span>
                        <span className="text-gray-600">= Rezervasyon yok</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsimListesiPage;
