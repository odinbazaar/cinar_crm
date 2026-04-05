import { useState, useEffect } from 'react'
import { 
    BarChart3, TrendingUp, Users, Calendar, PieChart, 
    RefreshCw, Clock, MessageSquare, Plus, FileText, 
    CheckCircle, AlertCircle, X, ChevronRight, Send,
    Download
} from 'lucide-react'
import apiClient from '../services/api'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'

interface WeeklyStats {
    period: {
        start: string;
        end: string;
    };
    stats: {
        newCustomers: number;
        weeklyRevenue: number;
        occupancyRate: number;
        totalInventory: number;
        activeBookings: number;
    };
    breakdown: Record<string, { total: number; occupied: number }>;
}

interface EmployeeReport {
    id: string;
    user_id: string;
    week_starting: string;
    content: string;
    status: 'SUBMITTED' | 'REVIEWED';
    review_note?: string;
    reviewed_by?: string;
    created_at: string;
    updated_at: string;
    user?: {
        first_name: string;
        last_name: string;
        email: string;
    };
    reviewer?: {
        first_name: string;
        last_name: string;
    };
}

export default function ReportsPage() {
    const { user, isManager } = useAuth()
    const { success, error: errorToast } = useToast()
    
    const [activeTab, setActiveTab] = useState<'stats' | 'employee'>('stats')
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState<WeeklyStats | null>(null)
    const [employeeReports, setEmployeeReports] = useState<EmployeeReport[]>([])
    
    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState<EmployeeReport | null>(null)
    const [reportContent, setReportContent] = useState('')
    const [reviewNote, setReviewNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (activeTab === 'stats') {
            fetchWeeklyReport()
        } else {
            fetchEmployeeReports()
        }
    }, [activeTab])

    const fetchWeeklyReport = async () => {
        setLoading(true)
        try {
            const data = await apiClient.get<WeeklyStats>('/reports/weekly')
            setReportData(data)
        } catch (err) {
            console.error('Report error:', err)
            errorToast('Rapor verileri yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const fetchEmployeeReports = async () => {
        setLoading(true)
        try {
            const endpoint = isManager ? '/reports/employee-reports' : `/reports/employee-reports?userId=${user?.id}`
            const data = await apiClient.get<EmployeeReport[]>(endpoint)
            setEmployeeReports(data)
        } catch (err) {
            console.error('Employee reports error:', err)
            errorToast('Çalışan raporları yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const getMondayOfCurrentWeek = () => {
        const d = new Date();
        const day = d.getDay();
        // Adjust for Sunday (0) to be 7, and Monday (1) to be 1
        const diff = d.getDate() - (day === 0 ? 6 : day - 1);
        const monday = new Date(d.setDate(diff));
        
        const year = monday.getFullYear();
        const month = String(monday.getMonth() + 1).padStart(2, '0');
        const date = String(monday.getDate()).padStart(2, '0');
        return `${year}-${month}-${date}`;
    };

    const handleOpenSubmit = () => {
        setSelectedReport(null)
        // Find if already submitted for this week
        const currentWeek = getMondayOfCurrentWeek()
        const existing = employeeReports.find(r => r.week_starting === currentWeek && r.user_id === user?.id)
        if (existing) {
            setSelectedReport(existing)
            setReportContent(existing.content)
        } else {
            setReportContent('')
        }
        setShowModal(true)
    }

    const handleOpenReview = (report: EmployeeReport) => {
        setSelectedReport(report)
        setReportContent(report.content)
        setReviewNote(report.review_note || '')
        setShowModal(true)
    }

    const handleSubmitReport = async () => {
        if (!reportContent.trim()) {
            errorToast('Rapor içeriği boş olamaz')
            return
        }

        setIsSubmitting(true)
        try {
            await apiClient.post('/reports/employee-reports/submit', {
                userId: user?.id,
                weekStarting: getMondayOfCurrentWeek(),
                content: reportContent
            })
            success('Rapor başarıyla kaydedildi')
            setShowModal(false)
            fetchEmployeeReports()
        } catch (err) {
            errorToast('Rapor kaydedilirken hata oluştu')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReviewReport = async () => {
        if (!selectedReport) return
        
        setIsSubmitting(true)
        try {
            await apiClient.post('/reports/employee-reports/review', {
                reportId: selectedReport.id,
                managerId: user?.id,
                reviewNote: reviewNote
            })
            success('Rapor onaylandı ve not eklendi')
            setShowModal(false)
            fetchEmployeeReports()
        } catch (err) {
            errorToast('Rapor onaylanırken hata oluştu')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStatsTab = () => {
        if (loading && !reportData) return null

        return (
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card p-6 border-l-4 border-blue-500 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Haftalık Ciro</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-2xl font-bold text-gray-900">
                                ₺{reportData?.stats.weeklyRevenue.toLocaleString('tr-TR')}
                            </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 italic flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Bu hafta onaylanan teklifler
                        </p>
                    </div>

                    <div className="card p-6 border-l-4 border-purple-500 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Doluluk Oranı</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            %{reportData?.stats.occupancyRate}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 italic">
                            {reportData?.stats.activeBookings} / {reportData?.stats.totalInventory} Aktif Ünite
                        </p>
                    </div>

                    <div className="card p-6 border-l-4 border-green-500 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Yeni Müşteri</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {reportData?.stats.newCustomers}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 italic">Son 7 günde kayıt olan</p>
                    </div>

                    <div className="card p-6 border-l-4 border-orange-500 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Aktif Rezervasyon</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {reportData?.stats.activeBookings}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 italic">Bugün itibariyle</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Envanter Doluluk Dağılımı</h3>
                                <p className="text-sm text-gray-500">Ünite tiplerine göre güncel kullanım oranları</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-end justify-around gap-4 px-4 bg-gray-50 rounded-xl py-6">
                            {reportData && Object.entries(reportData.breakdown).map(([type, { total, occupied }]) => {
                                const maxTotal = Math.max(...Object.values(reportData.breakdown).map(v => v.total), 1);
                                const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;
                                return (
                                    <div key={type} className="flex flex-col items-center gap-2 flex-1 max-w-[80px] group">
                                        <div className="relative w-full bg-white rounded-t-lg overflow-hidden h-full flex items-end border border-gray-100 shadow-sm">
                                            <div
                                                className="w-full rounded-t-sm relative flex flex-col justify-end"
                                                style={{ height: `${(total / maxTotal) * 100}%` }}
                                            >
                                                <div
                                                    className="w-full bg-primary-500 transition-all duration-500"
                                                    style={{ height: `${occupancyPct}%` }}
                                                />
                                                <div
                                                    className="w-full bg-gray-200 transition-all duration-500"
                                                    style={{ height: `${100 - occupancyPct}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{type}</span>
                                        <span className="text-xs text-gray-500">{occupied}/{total}</span>
                                    </div>
                                );
                            })}
                            {(!reportData || Object.keys(reportData.breakdown).length === 0) && (
                                <div className="w-full text-center text-gray-400 italic">Envanter verisi bulunmuyor</div>
                            )}
                        </div>
                    </div>

                    <div className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold">Rapor Notları</h3>
                        </div>
                        <div className="space-y-4 text-primary-50">
                            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                                <p className="text-sm font-medium mb-1 border-b border-white/20 pb-1">Cuma Raporu Hakkında</p>
                                <p className="text-xs opacity-90 leading-relaxed">
                                    Bu rapor her hafta Cuma günü mesai bitimine göre otomatik olarak hazırlanır. 
                                    Önceki Cuma'dan bu Cuma'ya kadar olan verileri kapsar.
                                </p>
                            </div>
                            <ul className="space-y-2 text-xs opacity-90">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 border" />
                                    <span>Ciro verileri 'Kabul Edilen' tekliflerden çekilir.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 border" />
                                    <span>Doluluk oranı o günkü aktif rezervasyonları baz alır.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white mt-1 border" />
                                    <span>Yalnızca yöneticiler bu sayfaya erişebilir.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderEmployeeTab = () => {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Çalışan Haftalık Raporları</h2>
                        <p className="text-sm text-gray-500 mt-1">Haftalık faaliyetlerinizi ve notlarınızı buradan paylaşabilirsiniz.</p>
                    </div>
                    {!isManager && (
                        <button 
                            onClick={handleOpenSubmit}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Rapor Yaz
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                            <p className="text-gray-500">Raporlar yükleniyor...</p>
                        </div>
                    ) : employeeReports.length === 0 ? (
                        <div className="py-20 text-center bg-white border border-dashed border-gray-300 rounded-2xl">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Henüz bir rapor bulunmuyor.</p>
                            {!isManager && <button 
                                onClick={handleOpenSubmit}
                                className="mt-4 text-primary-600 font-bold hover:underline"
                            >
                                İlk raporunu oluştur →
                            </button>}
                        </div>
                    ) : (
                        employeeReports.map(report => (
                            <div key={report.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900">
                                                    {isManager ? `${report.user?.first_name} ${report.user?.last_name}` : 'Haftalık Raporum'}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    report.status === 'REVIEWED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {report.status === 'REVIEWED' ? 'İncelendi' : 'Beklemede'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Hafta: {new Date(report.week_starting).toLocaleDateString('tr-TR')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {report.content.substring(0, 50)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isManager && report.status === 'SUBMITTED' ? (
                                            <button 
                                                onClick={() => handleOpenReview(report)}
                                                className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-bold rounded-lg hover:bg-primary-100 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                İncele
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleOpenReview(report)}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition-all"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {report.status === 'REVIEWED' && report.review_note && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 text-xs text-green-800 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold">Yönetici Notu ({report.reviewer?.first_name}):</span> {report.review_note}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
                    <p className="text-gray-600 mt-1">İşletme performansı ve çalışan faaliyet raporları</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={activeTab === 'stats' ? fetchWeeklyReport : fetchEmployeeReports}
                        disabled={loading}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Yenile
                    </button>
                    {activeTab === 'stats' && (
                        <button className="btn btn-primary flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            PDF İndir
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                        activeTab === 'stats' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Haftalık Genel Özet
                </button>
                <button
                    onClick={() => setActiveTab('employee')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                        activeTab === 'employee' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Çalışan Raporları
                </button>
            </div>

            {/* Content Container */}
            <div className="min-h-[400px]">
                {loading && (activeTab === 'stats' ? !reportData : employeeReports.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                        <p className="text-gray-500 font-medium">Veriler hazırlanıyor...</p>
                    </div>
                ) : (
                    activeTab === 'stats' ? renderStatsTab() : renderEmployeeTab()
                )}
            </div>

            {/* Report Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {selectedReport ? (isManager ? 'Raporu İncele' : 'Raporum') : 'Yeni Haftalık Rapor'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Hafta: {selectedReport ? new Date(selectedReport.week_starting).toLocaleDateString('tr-TR') : new Date(getMondayOfCurrentWeek()).toLocaleDateString('tr-TR')}
                                        {selectedReport?.user && ` • ${selectedReport.user.first_name} ${selectedReport.user.last_name}`}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rapor İçeriği</label>
                                <textarea 
                                    className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none text-sm"
                                    placeholder="Bu hafta neler yaptınız? Karşılaştığınız zorluklar ve başarılar nelerdir?"
                                    value={reportContent}
                                    onChange={(e) => setReportContent(e.target.value)}
                                    readOnly={isManager || (selectedReport?.status === 'REVIEWED')}
                                />
                                <p className="text-[10px] text-gray-400 mt-2">İçerik otomatik olarak kaydedilir.</p>
                            </div>

                            {(isManager || selectedReport?.review_note) && (
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Yönetici Değerlendirmesi / Notu</label>
                                    <textarea 
                                        className="w-full h-24 p-4 border border-gray-200 rounded-xl bg-amber-50/30 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none text-sm"
                                        placeholder="Çalışan için notunuzu buraya yazın..."
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        readOnly={!isManager || selectedReport?.status === 'REVIEWED'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-all"
                            >
                                Kapat
                            </button>
                            
                            {/* Show submit button only for employees and if not reviewed */}
                            {!isManager && selectedReport?.status !== 'REVIEWED' && (
                                <button 
                                    onClick={handleSubmitReport}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Raporu Gönder
                                </button>
                            )}

                            {/* Show review button only for managers and if submitted */}
                            {isManager && selectedReport?.status === 'SUBMITTED' && (
                                <button 
                                    onClick={handleReviewReport}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    İncelendi Olarak İşaretle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
