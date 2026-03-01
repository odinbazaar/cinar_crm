import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { inventoryService, bookingsService } from '../../services';

interface Location {
    id: string;
    kod: string;
    ilce: string;
    semt?: string;
    adres?: string;
    network?: number | string;
    durum: 'OPSİYON' | 'KESİN' | 'BOŞ';
}

interface WeeklyAvailabilityCardProps {
    isOpen: boolean;
    onClose: () => void;
    productType: string;
    network: string;
    week: string; // YYYY-MM-DD formatından DD.MM.YYYY'ye çevireceğiz veya öyle geliyorsa koruyacağız
}

export function WeeklyAvailabilityCard({ isOpen, onClose, productType, network, week }: WeeklyAvailabilityCardProps) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const parts = dateStr.split('T')[0].split('-');
            return `${parts[2]}.${parts[1]}.${parts[0]}`; 
        }
        return dateStr;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setIsLoading(true);
            try {
                const [inventory, allBookings] = await Promise.all([
                    inventoryService.getAll(),
                    bookingsService.getAll()
                ]);

                const targetWeekFormatted = normalizeDate(week);

                const matchingInventory = inventory.filter(item => {
                    const normalizeNet = (n: any) => (!n || n === 'null' || n === 'undefined' || n === 'Yok' || n === 'YOK') ? 'YOK' : String(n).toUpperCase();
                    const itemNet = normalizeNet(item.network);
                    const reqNet = normalizeNet(network);
                    const isNetMatch = reqNet === 'TÜMÜ' || itemNet === reqNet ||
                        (itemNet === 'BELEDİYE' && reqNet === 'BLD') ||
                        (itemNet === 'BLD' && reqNet === 'BELEDİYE');
                    return isNetMatch && item.type === productType;
                });

                const periodBookings = allBookings.filter(b => normalizeDate(b.start_date) === targetWeekFormatted);

                const list: Location[] = matchingInventory.map(item => {
                    const booking = periodBookings.find(b => b.inventory_item_id === item.id);
                    let durum: 'OPSİYON' | 'KESİN' | 'BOŞ' = 'BOŞ';
                    
                    if (booking) {
                        durum = booking.status as any || 'BOŞ';
                    }

                    return {
                        id: item.id,
                        kod: item.code,
                        ilce: item.district,
                        semt: item.neighborhood,
                        adres: item.address,
                        network: item.network,
                        durum
                    };
                });

                // Önce BOŞ, sonra OPSİYON, sonra KESİN
                list.sort((a, b) => {
                    if (a.durum === b.durum) return 0;
                    if (a.durum === 'BOŞ') return -1;
                    if (b.durum === 'BOŞ') return 1;
                    if (a.durum === 'OPSİYON') return -1;
                    return 1;
                });

                setLocations(list);

            } catch (err) {
                console.error("Availability view error", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, productType, network, week]);

    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-4 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Haftalık Müsaitlik</h3>
                    <p className="text-[10px] text-indigo-600 font-medium">Hafta: {normalizeDate(week)} | Net: {network} | {productType}</p>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                        Yükleniyor...
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">Bu kriterlere uygun envanter bulunamadı.</div>
                ) : (
                    <div className="space-y-2">
                        {locations.map(loc => {
                            const statusColor = loc.durum === 'BOŞ' ? 'text-green-600 bg-green-50 border-green-100' : loc.durum === 'OPSİYON' ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-red-600 bg-red-50 border-red-100';
                            
                            return (
                                <div key={loc.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-indigo-200 transition-colors group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-1.5 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                            <MapPin className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-gray-900">{loc.kod}</div>
                                            <div className="text-[10px] text-gray-500 truncate max-w-[150px] mt-0.5">{loc.ilce} / {loc.semt}</div>
                                        </div>
                                    </div>
                                    <div className={`text-[9px] font-bold px-2 py-1 rounded border uppercase ${statusColor}`}>
                                        {loc.durum}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="p-3 border-t border-gray-100 bg-white flex justify-between items-center text-[10px] font-bold text-gray-500">
                <div>Toplam: {locations.length} Lok.</div>
                <div className="flex gap-2">
                    <span className="text-green-600 px-2 py-1 bg-green-50 rounded-md border border-green-100">{locations.filter(l => l.durum === 'BOŞ').length} Boş</span>
                    <span className="text-orange-600 px-2 py-1 bg-orange-50 rounded-md border border-orange-100">{locations.filter(l => l.durum === 'OPSİYON').length} Ops</span>
                </div>
            </div>
        </div>
    );
}
