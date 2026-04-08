import React, { useState, useEffect } from 'react';
import { 
    Users, 
    BarChart3, 
    TrendingUp, 
    Download, 
    FileText, 
    RefreshCw, 
    Calendar, 
    Info, 
    Plus, 
    CheckCircle2, 
    Clock, 
    ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} text-white`}>
                {icon}
            </div>
            {trend && (
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

const ReportsPage: React.FC = () => {
    const { user, isManager } = useAuth();
    const [activeTab, setActiveTab] = useState<'stats' | 'employee'>('stats');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [employeeReports, setEmployeeReports] = useState<any[]>([]);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState<any>(null);
    const [submitContent, setSubmitContent] = useState('');
    const [reviewContent, setReviewContent] = useState('');

    const fetchWeeklyReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reports/weekly`);
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reports/employee-reports`);
            setEmployeeReports(response.data);
        } catch (error) {
            console.error('Error fetching employee reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'stats') {
            fetchWeeklyReport();
        } else {
            fetchEmployeeReports();
        }
    }, [activeTab]);

    const handleSubmitReport = async () => {
        if (!submitContent.trim()) return;
        try {
            await axios.post(`${API_URL}/reports/employee-reports/submit`, {
                userId: user?.id,
                weekStarting: new Date().toISOString(),
                content: submitContent
            });
            setShowSubmitModal(false);
            setSubmitContent('');
            fetchEmployeeReports();
        } catch (error) {
            console.error('Error submitting report:', error);
        }
    };

    const handleReviewReport = async (reportId: string) => {
        if (!reviewContent.trim()) return;
        try {
            await axios.post(`${API_URL}/reports/employee-reports/review`, {
                reportId,
                managerId: user?.id,
                reviewNote: reviewContent
            });
            setShowReviewModal(null);
            setReviewContent('');
            fetchEmployeeReports();
        } catch (error) {
            console.error('Error reviewing report:', error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header section with tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Raporlar & Analiz</h1>
                    <p className="text-gray-500 mt-2 font-medium">İşletme performansı ve ekip verimliliği özetleri</p>
                </div>

                <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                    <button
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeTab === 'stats' 
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Haftalık Özet
                    </button>
                    <button
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                            activeTab === 'employee' 
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('employee')}
                    >
                        Saha Raporları
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        className={`p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm ${loading ? 'animate-spin' : ''}`}
                        onClick={activeTab === 'stats' ? fetchWeeklyReport : fetchEmployeeReports}
                        title="Verileri Yenile"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    {activeTab === 'stats' && (
                        <button 
                            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-md active:scale-95"
                            onClick={() => alert('PDF Rapor Modülü Hazırlanıyor...')}
                        >
                            <Download className="w-4 h-4" />
                            PDF İndir
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {loading && !reportData && activeTab === 'stats' ? (
                <div className="flex flex-col items-center justify-center h-80 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Veriler derleniyor...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'stats' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Yeni Kayıt"
                                    value={reportData?.stats.newCustomers || 0}
                                    icon={<Users className="w-6 h-6" />}
                                    color="bg-indigo-500"
                                    trend="Müşteri Portföyü"
                                />
                                <StatCard
                                    title="Haftalık Ciro"
                                    value={`₺${(reportData?.stats.weeklyRevenue || 0).toLocaleString('tr-TR')}`}
                                    icon={<TrendingUp className="w-6 h-6" />}
                                    color="bg-emerald-500"
                                    trend="Onaylı Teklifler"
                                />
                                <StatCard
                                    title="Doluluk Oranı"
                                    value={`%${reportData?.stats.occupancyRate || 0}`}
                                    icon={<BarChart3 className="w-6 h-6" />}
                                    color="bg-orange-500"
                                    trend={`${reportData?.stats.activeBookings || 0}/${reportData?.stats.totalInventory || 0} Ünite`}
                                />
                                <StatCard
                                    title="Görev Özeti"
                                    value={employeeReports.length || 0}
                                    icon={<FileText className="w-6 h-6" />}
                                    color="bg-rose-500"
                                    trend="Aktif Kayıtlar"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Chart Section */}
                                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Envanter Kapasite Analizi</h2>
                                            <p className="text-sm text-gray-400 mt-1 font-medium">Ünite tiplerine göre gerçek zamanlı doluluk</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 bg-primary-500 rounded-sm"></div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Dolu</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-200"></div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Boş</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-80 flex items-end justify-between gap-4 px-6 py-8 bg-gray-50/50 rounded-2xl border border-gray-100 relative">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-x-8 inset-y-8 flex flex-col justify-between pointer-events-none opacity-20">
                                            {[...Array(5)].map((_, i) => <div key={i} className="border-t border-gray-400 w-full" />)}
                                        </div>

                                        {reportData && Object.entries(reportData.breakdown || {}).map(([type, stats]: [string, any]) => {
                                            const total = stats.total;
                                            const occupied = stats.occupied;
                                            const occupancyPct = total > 0 ? (occupied / total) * 100 : 0;
                                            const maxTotal = Math.max(...Object.values(reportData.breakdown || {}).map((v: any) => v.total), 1);
                                            const barHeight = (total / maxTotal) * 100;

                                            return (
                                                <div key={type} className="flex-1 flex flex-col items-center gap-4 h-full justify-end z-10 group max-w-[70px]">
                                                    <div className="flex-1 w-full flex items-end">
                                                        <div 
                                                            className="w-full bg-white rounded-t-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary-200"
                                                            style={{ height: `${barHeight}%`, minHeight: '8px' }}
                                                        >
                                                            <div 
                                                                className="w-full bg-primary-500 transition-all duration-700 ease-out group-hover:bg-primary-600 relative overflow-hidden"
                                                                style={{ height: `${occupancyPct}%` }}
                                                            >
                                                                {occupied > 0 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                                            </div>
                                                            <div className="flex-1 bg-gray-100 opacity-50" />
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-gray-800 tracking-tighter">{type}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 mt-0.5">{occupied}/{total}</p>
                                                    </div>
                                                    
                                                    {/* Hover Value */}
                                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-xl">
                                                        {occupied} Dolu ({Math.round(occupancyPct)}%)
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!reportData || Object.keys(reportData.breakdown || {}).length === 0) && !loading && (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium italic">
                                                Görüntülenecek veri bulunmuyor
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            Sistem Verisi
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rapor Aralığı</p>
                                                <p className="text-sm font-bold text-gray-700">
                                                    {reportData ? `${new Date(reportData.period.start).toLocaleDateString('tr-TR')} - ${new Date(reportData.period.end).toLocaleDateString('tr-TR')}` : '---'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1.5">Durum</p>
                                                <div className="flex items-center gap-2 text-primary-700">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-sm font-bold">Veriler Güncel</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
                                        <div className="flex items-center gap-3 mb-4">
                                            <Info className="w-5 h-5 text-primary-400" />
                                            <h4 className="font-bold">Önemli Notlar</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            <li className="text-[11px] text-gray-300 leading-relaxed flex gap-2">
                                                <span className="text-primary-500 font-bold">•</span>
                                                Ciro verileri 'ONAYLANMIŞ' teklifler üzerinden hesaplanır.
                                            </li>
                                            <li className="text-[11px] text-gray-300 leading-relaxed flex gap-2">
                                                <span className="text-primary-500 font-bold">•</span>
                                                Doluluk oranı yalnızca 'KESİN' durumdaki kayıtları gösterir.
                                            </li>
                                            <li className="text-[11px] text-gray-300 leading-relaxed flex gap-2">
                                                <span className="text-primary-500 font-bold">•</span>
                                                Veriler günlük olarak senkronize edilmektedir.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Saha & Ekip Raporları</h2>
                                    <p className="text-sm text-gray-400 mt-1 font-medium">Haftalık faaliyetlerin yönetici inceleme alanı</p>
                                </div>
                                <button
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                                    onClick={() => setShowSubmitModal(true)}
                                >
                                    <Plus className="w-4 h-4" />
                                    Yeni Rapor Gönder
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Çalışan</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hafta</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Özet</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksiyon</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {employeeReports.map((report) => (
                                            <tr key={report.id} className="group hover:bg-primary-50/30 transition-all">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-xs text-primary-600 shadow-sm group-hover:border-primary-200">
                                                            {report.user.first_name[0]}{report.user.last_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{report.user.first_name} {report.user.last_name}</p>
                                                            <p className="text-[10px] font-medium text-gray-400">{report.user.role || 'Saha Personeli'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock className="w-3.5 h-3.5 opacity-40" />
                                                        <span className="text-xs font-bold">{new Date(report.week_starting).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                        report.status === 'REVIEWED' 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {report.status === 'REVIEWED' ? 'İNCELENDİ' : 'BEKLEMEDE'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{report.content}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                                        onClick={() => setShowReviewModal(report)}
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {employeeReports.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="max-w-xs mx-auto">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                                            <FileText className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <h4 className="text-gray-900 font-bold">Rapor Bulunmuyor</h4>
                                                        <p className="text-xs text-gray-400 mt-2">Henüz bu hafta için gönderilmiş çalışan raporu bulunmuyor.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modals placeholders */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50">
                            <h3 className="text-xl font-black text-gray-900">Haftalık Rapor Gönder</h3>
                            <p className="text-sm text-gray-400 mt-1">Lütfen bu haftaki çalışmalarınızı özetleyin</p>
                        </div>
                        <div className="p-8">
                            <textarea
                                className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                                placeholder="Örn: 20 yeni müşteri başvurusu alındı, 5 tanesi ile görüşme yapıldı..."
                                value={submitContent}
                                onChange={(e) => setSubmitContent(e.target.value)}
                            />
                            <div className="flex gap-4 mt-8">
                                <button
                                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                    onClick={() => setShowSubmitModal(false)}
                                >
                                    İptal
                                </button>
                                <button
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                                    onClick={handleSubmitReport}
                                >
                                    Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReviewModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Rapor Detayı</h3>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">{showReviewModal.user.first_name} {showReviewModal.user.last_name}</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-900" onClick={() => setShowReviewModal(null)}>
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-3">Rapor İçeriği</p>
                                <p className="text-gray-700 leading-relaxed text-sm font-medium whitespace-pre-wrap">{showReviewModal.content}</p>
                            </div>

                            {showReviewModal.review_note && (
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Yönetici Notu</p>
                                    <p className="text-emerald-900 text-sm font-medium italic">"{showReviewModal.review_note}"</p>
                                </div>
                            )}

                            {isManager && showReviewModal.status !== 'REVIEWED' && (
                                <div className="pt-4 border-t border-gray-100 italic text-gray-400">
                                    <p className="text-xs mb-4">Bu raporu incelediyseniz not ekleyerek kapatabilirsiniz:</p>
                                    <textarea
                                        className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                        placeholder="Görüşünüzü yazın..."
                                        value={reviewContent}
                                        onChange={(e) => setReviewContent(e.target.value)}
                                    />
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                                            onClick={() => setShowReviewModal(null)}
                                        >
                                            Kapat
                                        </button>
                                        <button
                                            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                                            onClick={() => handleReviewReport(showReviewModal.id)}
                                        >
                                            Raporu Onayla
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
