import React from 'react'
import { X, Send, Plus, ShoppingBag } from 'lucide-react'
import type { Customer, Proposal, ProposalItem } from '../../types/sales'
import { 
    getProductTypes, 
    calculateProductTotal, 
    calculatePrintingTotal, 
    calculateOperationTotal, 
    calculateSubtotal, 
    calculateKDV, 
    calculateGrandTotal 
} from '../../utils/salesUtils'

interface ProposalModalProps {
    showProposalModal: boolean
    setShowProposalModal: (show: boolean) => void
    selectedCustomer: Customer | null
    selectedProposal: Proposal | null
    proposalItems: ProposalItem[]
    addProposalItem: () => void
    removeProposalItem: (index: number) => void
    updateProposalItem: (index: number, field: keyof ProposalItem, value: any) => void
    isBlockList: boolean
    setIsBlockList: (value: boolean) => void
    kdvRate: 20 | 14
    setKdvRate: (value: 20 | 14) => void
    durationWeeks: number
    onAddToMainProposal: (items: ProposalItem[], isBlock: boolean, rate: 20 | 14) => void
    onShowMainProposal?: () => void
    showShowMainProposal?: boolean
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
    showProposalModal,
    setShowProposalModal,
    selectedCustomer,
    selectedProposal,
    proposalItems,
    addProposalItem,
    removeProposalItem,
    updateProposalItem,
    isBlockList,
    setIsBlockList,
    kdvRate,
    setKdvRate,
    durationWeeks,
    onAddToMainProposal,
    onShowMainProposal,
    showShowMainProposal
}) => {
    if (!showProposalModal || !selectedCustomer) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Bütçe Teklifi Hazırla</h2>
                        <p className="text-sm text-gray-500">{selectedCustomer.companyName}</p>
                    </div>
                    <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                            <strong>Müşteri:</strong> {selectedCustomer.companyName}<br />
                            <strong>E-posta:</strong> {selectedCustomer.email}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Ürün</h3>
                        </div>

                        {/* Column Headers */}
                        <div className="flex gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            <div className="flex-1 min-w-[140px]">Ürün Tipi</div>
                            <div className="w-14 flex-none">Dönem</div>
                            <div className="w-12 flex-none">Adet</div>
                            <div className="w-20 flex-none">Birim F.</div>
                            <div className="w-20 flex-none text-blue-500">İndirimli</div>
                            <div className="w-20 flex-none">Baskı</div>
                            <div className="w-20 flex-none">Op. Bedel</div>
                            <div className="w-16 flex-none text-orange-500">Op. Adet</div>
                            <div className="w-28 flex-none text-right">Toplam</div>
                            {proposalItems.length > 1 && <div className="w-8 flex-none"></div>}
                        </div>

                        {proposalItems.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <div className="flex-1 min-w-[140px] relative">
                                    <select
                                        value={item.type}
                                        onChange={(e) => updateProposalItem(index, 'type', e.target.value)}
                                        className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-[11px] pr-8 appearance-none bg-white"
                                    >
                                        {getProductTypes().map((pt: any) => (
                                            <option key={pt.code} value={pt.code}>{pt.code} - {pt.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => window.open(`/inventory?type=${item.type}`, '_blank')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-all group/info"
                                        title="Envanter Durumunu Gör"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/info:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">Envanteri Aç</span>
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.weekLayout || ''}
                                    onChange={(e) => updateProposalItem(index, 'weekLayout', e.target.value)}
                                    className="w-14 flex-none px-1.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-[11px] text-center"
                                    placeholder="W"
                                />
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateProposalItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-12 flex-none px-1.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-[11px] text-center"
                                    placeholder="Q"
                                    readOnly={(item.type === 'BB' || item.type === 'GB') && !!item.network}
                                    min="0"
                                />
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateProposalItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                                    className="w-20 flex-none px-1.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-[11px]"
                                    placeholder="Birim"
                                />
                                <input
                                    type="number"
                                    value={item.discountedPrice || 0}
                                    onChange={(e) => updateProposalItem(index, 'discountedPrice', parseInt(e.target.value) || 0)}
                                    className="w-20 flex-none px-1.5 py-2 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-[11px] font-medium text-blue-700"
                                    placeholder="İnd"
                                />
                                <input
                                    type="number"
                                    value={item.printingCost}
                                    onChange={(e) => updateProposalItem(index, 'printingCost', parseInt(e.target.value) || 0)}
                                    className="w-20 flex-none px-1.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-[11px]"
                                    placeholder="Baskı"
                                />
                                <input
                                    type="number"
                                    value={item.operationCost}
                                    onChange={(e) => updateProposalItem(index, 'operationCost', parseInt(e.target.value) || 0)}
                                    className="w-20 flex-none px-1.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-[11px]"
                                    placeholder="Op"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={item.opQty || 1}
                                    onChange={(e) => updateProposalItem(index, 'opQty', parseInt(e.target.value) || 1)}
                                    className="w-16 flex-none px-1.5 py-2 border border-orange-200 bg-orange-50/30 rounded-lg focus:ring-2 focus:ring-orange-500 text-[11px] font-bold text-orange-700 text-center"
                                    placeholder="Adet"
                                />
                                <span className="w-28 flex-none text-right font-bold text-gray-900 text-[11px] whitespace-nowrap">
                                    ₺{(() => {
                                        const qty = Number(item.quantity) || 0;
                                        if (qty <= 0) return "0";
                                        const period = parseInt(item.weekLayout || '1') || 1;
                                        const price = (item.discountedPrice && item.discountedPrice > 0) ? item.discountedPrice : item.unitPrice;
                                        const opMultiplier = Number(item.opQty) || 1;
                                        const prCost = Number(item.printingCost) || 0;
                                        const opCost = Number(item.operationCost) || 0;
                                        const total = (qty * price * period) + (prCost * qty * opMultiplier) + (opCost * qty * opMultiplier);
                                        return isNaN(total) ? "0" : total.toLocaleString();
                                    })()}
                                </span>
                                {proposalItems.length > 1 && (
                                    <button
                                        onClick={() => removeProposalItem(index)}
                                        className="w-8 flex-none flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* KDV Seçimi */}
                    <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                        <span className="text-sm font-medium text-gray-700">KDV Oranı:</span>
                        <div className="flex gap-4">
                            {[20, 14].map(rate => (
                                <label key={rate} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="kdvRate"
                                        value={rate}
                                        checked={kdvRate === rate}
                                        onChange={() => setKdvRate(rate as 20 | 14)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">%{rate}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Detaylı Hesaplama */}
                    <div className="pt-2 space-y-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ürün Bedeli:</span>
                            <span className="font-medium text-gray-900">₺{calculateProductTotal(proposalItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Baskı Bedeli (Toplam):</span>
                            <span className="font-medium text-blue-600">₺{calculatePrintingTotal(proposalItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Operasyon Maliyeti (Toplam):</span>
                            <span className="font-medium text-orange-600">₺{calculateOperationTotal(proposalItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base border-t border-gray-100 pt-3">
                            <span className="text-gray-600 font-medium">Ara Toplam:</span>
                            <span className="font-semibold text-gray-900">₺{calculateSubtotal(proposalItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">KDV (%{kdvRate}):</span>
                            <span className="font-medium text-gray-900">₺{calculateKDV(proposalItems, kdvRate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50 rounded-xl p-4 -mx-2 mt-2 border border-blue-100">
                            <span className="text-lg font-bold text-gray-900">GENEL TOPLAM:</span>
                            <span className="text-3xl font-black text-blue-600">
                                ₺{(() => {
                                    const hasValidItems = proposalItems.some(item => Number(item.quantity) > 0);
                                    if (!hasValidItems) return "0";
                                    return calculateGrandTotal(proposalItems, kdvRate).toLocaleString();
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50/50">
                    <button
                        onClick={() => setShowProposalModal(false)}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => {
                            onAddToMainProposal(proposalItems, isBlockList, kdvRate);
                            setShowProposalModal(false);
                        }}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200/50 flex items-center gap-2"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        Teklife Ekle
                    </button>
                    {onShowMainProposal && showShowMainProposal && (
                        <button
                            onClick={onShowMainProposal}
                            className="px-6 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2"
                        >
                            <ShoppingBag className="w-4.5 h-4.5" />
                            Ana Teklifi Göster
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
