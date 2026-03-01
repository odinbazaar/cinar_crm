import React, { useState, useEffect } from 'react';
import { X, Calendar, Send, Info } from 'lucide-react';
import type { Proposal, ProposalItem } from '../../types/sales';
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
    
    // Form for each product in the proposal
    const [itemsData, setItemsData] = useState<{
        id: string; // generated
        type: string;
        code: string;
        quantity: number;
        startDate: string;
        durationWeeks: number;
    }[]>([]);

    useEffect(() => {
        if (isOpen && proposal) {
            const initialData = proposal.items.map((item, idx) => ({
                id: `item-${idx}`,
                type: item.type || 'BB',
                code: item.code || 'Bilinmeyen Ürün',
                quantity: item.quantity || 1,
                startDate: new Date().toISOString().split('T')[0],
                durationWeeks: parseInt(item.weekLayout || '1') || 1,
            }));
            setItemsData(initialData);
        }
    }, [isOpen, proposal]);

    if (!isOpen || !proposal) return null;

    const handleItemChange = (index: number, field: string, value: any) => {
        const newData = [...itemsData];
        newData[index] = { ...newData[index], [field]: value };
        setItemsData(newData);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
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
                        <p>Bu teklifi onaylayıp Rezervasyon birimine iletmek için onaylanan her bir ürünün <b>Başlangıç Tarihini</b> ve <b>Hafta Sayısını</b> (Dönem) doldurunuz.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Onaylanan Ürünler</h3>
                        
                        {itemsData.map((item, idx) => (
                            <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm relative group">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-5">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ürün / Adet</label>
                                        <div className="font-medium text-gray-900 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2">
                                            <span className="font-bold text-primary-600">{item.quantity}x</span> {item.code}
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Başlangıç Tarihi</label>
                                        <div className="relative">
                                            <input 
                                                type="date" 
                                                className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                                value={item.startDate}
                                                onChange={(e) => handleItemChange(idx, 'startDate', e.target.value)}
                                            />
                                            <Calendar className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Dönem (Hafta)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full pl-3 pr-12 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-center" 
                                                value={item.durationWeeks}
                                                onChange={(e) => handleItemChange(idx, 'durationWeeks', parseInt(e.target.value) || 1)}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase text-gray-400 font-bold pointer-events-none">Hafta</span>
                                        </div>
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
