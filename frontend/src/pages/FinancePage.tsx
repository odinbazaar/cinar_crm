import { useState, useEffect } from 'react'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts'

import { expenseCategories } from '../services/budgetService'
import { financeService, type DashboardData } from '../services/financeService'

export default function FinancePage() {
    const [dateFilter, setDateFilter] = useState('bu-yil')
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [dateFilter])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const result = await financeService.getDashboardData(dateFilter)
            setData(result)
        } catch (error) {
            console.error('Failed to load finance data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const { stats, monthlyData, recentTransactions } = data || {
        stats: { totalRevenue: 0, totalExpense: 0, netProfit: 0, margin: '0' },
        monthlyData: [],
        recentTransactions: []
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
                            <Wallet className="w-6 h-6" />
                        </div>
                        Finans Yönetimi
                    </h1>
                    <p className="text-gray-500 mt-1">Gelir, gider ve finansal raporlar (Gerçek Veriler)</p>
                </div>

                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="text-sm bg-transparent border-none focus:ring-0 text-gray-700"
                        >
                            <option value="bu-ay">Bu Ay</option>
                            <option value="bu-ceyrek">Bu Çeyrek</option>
                            <option value="bu-yil">Bu Yıl</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Ciro</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺{stats.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>Tekliflerden</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Gider</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺{stats.totalExpense.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>Projelerden</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Kar</p>
                            <h3 className={`text-2xl font-bold mt-2 ${stats.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                ₺{stats.netProfit.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div className={`bg-green-500 h-2 rounded-full`} style={{ width: `${Math.min(Number(stats.margin), 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">%{stats.margin} kar marjı</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Beklenen Tahsilat</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺{(stats.totalRevenue * 0.8).toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>Tahmini %80</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Finansal Analiz</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `₺${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar name="Planlanan Gelir" dataKey="butce" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                <Bar name="Gerçekleşen Gider" dataKey="harcanan" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Gider Dağılımı (Örnek)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={expenseCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {expenseCategories.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-medium text-gray-900">₺{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Son Finansal Hareketler (Projeler ve Teklifler)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-3">İşlem Adı</th>
                                <th className="px-6 py-3">Kategori</th>
                                <th className="px-6 py-3">Tarih</th>
                                <th className="px-6 py-3 text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        {transaction.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                                            {transaction.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{transaction.date}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {recentTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Henüz işlem kaydı bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
