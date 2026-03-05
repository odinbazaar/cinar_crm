import React, { useState, useEffect } from 'react';
import { X, Calendar, Send, Info, Plus, Trash2 } from 'lucide-react';
import type { Proposal } from '../../types/sales';
import { useToast } from '../../hooks/useToast';

interface ApproveProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposal: Proposal | null;
    onApprove: (proposalId: string, itemsData: any[]) => Promise<void>;
}

export function ApproveProposalModal({ isOpen, onClose, proposal, onApprove }: ApproveProposalModalProps) {
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const [itemsData, setItemsData] = useState<{
        id: string;
        type: string;
        code: string;
        network: string;
        quantity: number;
        startDate: string;
        endDate: string;
    }[]>([]);

    useEffect(() => {
        if (isOpen && proposal) {
            const initialData = proposal.items.map((item, idx) => {
                const start = new Date().toISOString().split('T')[0];
                const weeks = parseInt(item.weekLayout || '1') || 1;
                const startDateObj = new Date(start);
                const endDateObj = new Date(startDateObj.getTime() + (weeks * 7 * 24 * 60 * 60 * 1000));
                const end = endDateObj.toISOString().split('T')[0];

                return {
                    id: `item-${idx}-${Date.now()}`,
                    type: item.type || 'BB',
                    code: item.code || item.description || 'Bilinmeyen Ürün',
                    network: item.network || 'Tümü',
                    quantity: item.quantity || 1,
                    startDate: start,
                    endDate: end,
                };
            });
            setItemsData(initialData);
        }
    }, [isOpen, proposal]);

    if (!isOpen || !proposal) return null;

    const handleItemChange = (index: number, field: string, value: any) => {
        const newData = [...itemsData];
        newData[index] = { ...newData[index], [field]: value };
        setItemsData(newData);
    };

    const handleAddRow = (index: number) => {
        const item = itemsData[index];
        const newRow = {
            ...item,
            id: `item-new-${Date.now()}-${Math.random()}`,
        };
        const newData = [...itemsData];
        newData.splice(index + 1, 0, newRow);
        setItemsData(newData);
    };

    const handleRemoveRow = (index: number) => {
        if (itemsData.length <= 1) return;
        setItemsData(itemsData.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        setIsLoading(true);
        try {
            await onApprove(proposal.id, itemsData);
            onClose();
        } catch (err) {
            console.error('Approve and send error:', err);
            error('Gönderim sırasında hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Teklifi Onayla & Rezervasyona İlet</h2>
                        <p className="text-sm text-gray-500">{proposal.proposalNumber} - {proposal.customerName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3">
                        <Info className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                        <p>Rezervasyon birimine iletmek için her ürünün <b>Başlangıç</b> ve <b>Bitiş</b> tarihlerini doldurunuz. Aynı ürün için farklı tarih aralıkları gerekiyorsa (+) butonuna tıklayın.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Onaylanan Ürünler</h3>
                        
                        {itemsData.map((item, idx) => (
                            <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm relative group hover:border-blue-200 transition-colors">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ürün / Adet</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                            <div className="flex-1 font-medium text-gray-900 px-3 py-2 border border-gray-100 bg-gray-50 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis flex items-center">
                                                {item.code}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Başlangıç Tarihi</label>
                                        <div className="relative">
                                            <input 
                                                type="date" 
                                                className="w-full pl-9 pr-3 py-2 border border-blue-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                                                value={item.startDate}
                                                onChange={(e) => handleItemChange(idx, 'startDate', e.target.value)}
                                            />
                                            <Calendar className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bitiş Tarihi</label>
                                        <div className="relative">
                                            <input 
                                                type="date" 
                                                className="w-full pl-9 pr-3 py-2 border border-orange-100 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" 
                                                value={item.endDate}
                                                onChange={(e) => handleItemChange(idx, 'endDate', e.target.value)}
                                            />
                                            <Calendar className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex gap-1">
                                        <button 
                                            onClick={() => handleAddRow(idx)}
                                            className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center border border-blue-100 shadow-sm"
                                            title="Satır Ekle"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveRow(idx)}
                                            className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center border border-red-100 shadow-sm"
                                            title="Satır Sil"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        İptal
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={isLoading}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 flex items-center gap-2 transition-colors shadow-sm"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Rezervasyona Gönder
                    </button>
                </div>
            </div>
        </div>
    );
}
