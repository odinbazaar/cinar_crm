import { useState } from 'react'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PieChart,
    Wallet,
    CreditCard,
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

// Mock Data
const monthlyData = [
    { name: 'Ocak', butce: 500000, harcanan: 350000 },
    { name: 'Şubat', butce: 500000, harcanan: 420000 },
    { name: 'Mart', butce: 600000, harcanan: 550000 },
    { name: 'Nisan', butce: 600000, harcanan: 480000 },
    { name: 'Mayıs', butce: 750000, harcanan: 600000 },
    { name: 'Haziran', butce: 750000, harcanan: 680000 },
]

// expenseCategories imported from budgetService

const recentTransactions = [
    { id: 1, title: 'Network Kurulumu', type: 'expense', amount: 15000, date: '2025-06-15', category: 'Operasyon' },
    { id: 2, title: 'Müşteri Ödemesi', type: 'income', amount: 45000, date: '2025-06-14', category: 'Satış' },
    { id: 3, title: 'Sunucu Bakımı', type: 'expense', amount: 3500, date: '2025-06-12', category: 'Altyapı' },
    { id: 4, title: 'Personel Maaşları', type: 'expense', amount: 125000, date: '2025-06-01', category: 'Personel' },
    { id: 5, title: 'Yeni Proje Avansı', type: 'income', amount: 80000, date: '2025-05-28', category: 'Satış' },
]

export default function BudgetPage() {
    const [dateFilter, setDateFilter] = useState('bu-yil')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl text-white">
                            <Wallet className="w-6 h-6" />
                        </div>
                        Bütçe Yönetimi
                    </h1>
                    <p className="text-gray-500 mt-1">Gelir, gider ve bütçe planlaması</p>
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
                            <p className="text-sm font-medium text-gray-500">Toplam Bütçe</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺3,700,000</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>Geçen yıla göre +12%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Toplam Harcama</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺3,050,000</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>Bütçe aşımı riski yok</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Kalan Bütçe</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺650,000</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">%18 kullanılabilir</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Beklenen Gelir</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">₺4,200,000</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>Hedefin %95'i</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Bütçe ve Harcama Analizi</h2>
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
                                <Bar name="Planlanan Bütçe" dataKey="butce" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                <Bar name="Gerçekleşen Harcama" dataKey="harcanan" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Harcama Dağılımı</h2>
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
                    <h2 className="text-lg font-bold text-gray-900">Son İşlemler</h2>
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
