import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, RefreshCw, Calendar } from 'lucide-react';
import { customerRequestsService } from '../../services';

interface Request {
    id: string;
    customerName: string;
    brandName: string;
    productType: string;
    network: string;
    week: string;
    availableCount: number;
    optionsCount: number;
    status: string;
    originalData: any;
}

interface PendingRequestsCardProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: (request: any) => void;
}

export function WeeklyAvailabilityCard({ isOpen, onClose, onProcess }: PendingRequestsCardProps) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        if (!isOpen) return;
        setIsLoading(true);
        try {
            const allRequests = await customerRequestsService.getAll();
            const pending = allRequests
                .filter((r: any) => r.status === 'pending')
                .map((r: any) => ({
                    id: r.id,
                    customerName: r.client?.company_name || r.customer_name || 'Bilinmeyen Müşteri',
                    brandName: r.brand_name || '-',
                    productType: r.product_type || '-',
                    network: String(r.network || '-'),
                    week: r.usage_period || '-',
                    availableCount: r.available_count || 0,
                    optionsCount: r.options_count || 0,
                    status: r.status,
                    originalData: r // Orijinal veriyi sakla
                }));
            setRequests(pending);
        } catch (err) {
            console.error("Pending requests fetch error", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isOpen]);

    const normalizeDate = (dateStr: string): string => {
        if (!dateStr || dateStr === '-') return '-';
        if (dateStr.includes('-')) {
            const parts = dateStr.split('T')[0].split('-');
            return `${parts[2]}.${parts[1]}.${parts[0]}`; 
        }
        return dateStr;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-24 right-6 z-50 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-sm">Bekleyen İşler</h3>
                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{requests.length} Bekleyen Talep</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchData}
                        className="p-2 hover:bg-white/50 rounded-xl transition-all text-orange-600"
                        title="Yenile"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-all text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-400 text-sm flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                        <p className="font-bold">Talepler yükleniyor...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 m-2">
                        <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400 tracking-tight">Bekleyen iş bulunmuyor</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase">Tebrikler! Tüm operasyon güncel.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="text-[11px] font-black text-gray-900 uppercase leading-none mb-1 group-hover:text-orange-600 transition-colors">
                                                {req.customerName}
                                            </div>
                                            <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">
                                                {req.brandName}
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-full uppercase">YENİ</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase leading-none">Hafta</p>
                                                <p className="text-[10px] font-black text-gray-700 leading-none mt-1">{normalizeDate(req.week)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase leading-none">Mik. / Detay</p>
                                                <p className="text-[10px] font-black text-gray-700 leading-none mt-1">
                                                    {req.availableCount + req.optionsCount} Lok. | {req.productType}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => onProcess(req.originalData)}
                                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                        TALEBİ İŞLE (HIZALA)
                                        <CheckCircle className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="bg-indigo-900 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none">Haftalık Bekleyen</p>
                            <p className="text-xl font-black mt-1">{requests.length} <span className="text-[10px] text-indigo-300 font-bold uppercase">TALEP</span></p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-indigo-400/50" />
                    </div>
                </div>
            </div>
        </div>
    );
}
