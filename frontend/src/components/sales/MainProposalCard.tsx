import React from 'react'
import { ShoppingBag, X, Send, Trash2, FileText } from 'lucide-react'
import type { ProposalItem } from '../../types/sales'

interface MainProposalCardProps {
    items: ProposalItem[]
    onRemoveItem: (index: number) => void
    onSend: () => void
    customerName: string
    totalAmount: number
}

export const MainProposalCard: React.FC<MainProposalCardProps> = ({
    items,
    onRemoveItem,
    onSend,
    customerName,
    totalAmount
}) => {
    if (items.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-[40] animate-in slide-in-from-bottom-5 duration-300">
            <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary-100" />
                    <div>
                        <h3 className="text-sm font-bold leading-tight">Ana Teklif Taslağı</h3>
                        <p className="text-[10px] text-primary-100 font-medium opacity-80">{customerName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                    <span className="text-xs font-bold">{items.length}</span>
                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Ürün</span>
                </div>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {items.map((item, idx) => (
                    <div key={idx} className="p-3 hover:bg-gray-50 group transition-colors">
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold rounded">
                                        {item.type}
                                    </span>
                                    <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">
                                        {item.code}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                    <span>{item.quantity} Adet</span>
                                    {item.weekLayout && (
                                        <>
                                            <span className="opacity-30">•</span>
                                            <span>{item.weekLayout} Dönem</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => onRemoveItem(idx)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Toplam Değer</span>
                    <div className="text-right">
                        <div className="text-xl font-black text-primary-600 leading-none">
                            ₺{totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase">KDV Dahil Değil</div>
                    </div>
                </div>
                
                <button
                    onClick={onSend}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-200"
                >
                    <Send className="w-4 h-4" />
                    <span>Teklifi Hazırla ve Gönder</span>
                </button>

                <p className="text-[9px] text-center text-gray-400 font-medium leading-relaxed px-4 text-balance">
                    Ürünleri eklemeye devam edebilir veya hemen taslağı mail olarak gönderebilirsiniz.
                </p>
            </div>
        </div>
    )
}
