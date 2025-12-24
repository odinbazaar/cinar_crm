import { useState } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, PieChart, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'
import { mockBookings, mockInventory } from '../services/mockData'

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('this_month')

    // Calculate basic stats
    const totalInventory = mockInventory.length
    const activeBookings = mockBookings.filter(b => b.status === 'CONFIRMED').length
    const occupancyRate = Math.round((activeBookings / totalInventory) * 100)
    const totalRevenue = activeBookings * 15000 // Dummy average price

    // Inventory Type Distribution
    const typeDistribution = {
        BB: mockInventory.filter(i => i.type === 'BB').length,
        CLP: mockInventory.filter(i => i.type === 'CLP').length,
        MGL: mockInventory.filter(i => i.type === 'MGL').length,
        GB: mockInventory.filter(i => i.type === 'GB').length,
    }

    // Mock monthly data for the chart
    const monthlyData = [
        { month: 'Oca', value: 65 },
        { month: 'Şub', value: 59 },
        { month: 'Mar', value: 80 },
        { month: 'Nis', value: 81 },
        { month: 'May', value: 56 },
        { month: 'Haz', value: 55 },
        { month: 'Tem', value: 40 },
        { month: 'Ağu', value: 70 },
        { month: 'Eyl', value: 85 },
        { month: 'Eki', value: 90 },
        { month: 'Kas', value: 95 },
        { month: 'Ara', value: 88 },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Raporlar & Analizler</h1>
                    <p className="text-gray-600 mt-1">Finansal durum ve envanter performansı</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="input py-2 pr-8"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="this_month">Bu Ay</option>
                        <option value="last_month">Geçen Ay</option>
                        <option value="this_year">Bu Yıl</option>
                    </select>
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Dışa Aktar
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +12.5%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Toplam Ciro</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₺{totalRevenue.toLocaleString('tr-TR')}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +4.2%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Doluluk Oranı</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        %{occupancyRate}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-full">
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                            -2.1%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Aktif Rezervasyon</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {activeBookings}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +8.4%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Yeni Müşteri</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        12
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Occupancy Chart */}
                <div className="card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Aylık Doluluk Trendi</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Detaylı Rapor</button>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {monthlyData.map((data) => (
                            <div key={data.month} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-full flex items-end">
                                    <div
                                        className="w-full bg-primary-500 hover:bg-primary-600 transition-all duration-500 rounded-t-lg relative group-hover:shadow-lg"
                                        style={{ height: `${data.value}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            %{data.value} Doluluk
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory Distribution */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Envanter Dağılımı</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Billboard (BB)</span>
                                <span className="text-gray-900 font-bold">{typeDistribution.BB}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(typeDistribution.BB / totalInventory) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Raket (CLP)</span>
                                <span className="text-gray-900 font-bold">{typeDistribution.CLP}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${(typeDistribution.CLP / totalInventory) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Megalight (MGL)</span>
                                <span className="text-gray-900 font-bold">{typeDistribution.MGL}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${(typeDistribution.MGL / totalInventory) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Giant Board (GB)</span>
                                <span className="text-gray-900 font-bold">{typeDistribution.GB}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{ width: `${(typeDistribution.GB / totalInventory) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Toplam Envanter</span>
                            <span className="font-bold text-gray-900 text-lg">{totalInventory}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
