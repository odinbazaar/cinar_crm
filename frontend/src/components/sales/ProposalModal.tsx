import React from 'react'
import { X, Send } from 'lucide-react'
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
    blockOperationQuantity: number
    setBlockOperationQuantity: (value: number) => void
    kdvRate: 20 | 14
    setKdvRate: (value: 20 | 14) => void
    durationWeeks: number
    setShowEmailModal: (show: boolean) => void
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
    blockOperationQuantity,
    setBlockOperationQuantity,
    kdvRate,
    setKdvRate,
    durationWeeks,
    setShowEmailModal
}) => {
    if (!showProposalModal || !selectedCustomer) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
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
                            <h3 className="font-medium text-gray-900">Ürünler</h3>
                            <button
                                onClick={addProposalItem}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                + Ürün Ekle
                            </button>
                        </div>

                        {/* Column Headers */}
                        <div className="flex gap-3 px-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <div className="flex-1 min-w-[150px]">Ürün Tipi</div>
                            <div className="w-20">Dönem</div>
                            <div className="w-14">Adet</div>
                            <div className="w-20">Birim Fiyat</div>
                            <div className="w-20">İndirimli</div>
                            <div className="w-20">Baskı</div>
                            <div className="w-20">Op. Bedeli</div>
                            <div className="w-28 text-right">Toplam</div>
                            {proposalItems.length > 1 && <div className="w-8"></div>}
                        </div>

                        {proposalItems.map((item, index) => (
                            <div key={index} className="flex gap-3 items-center">
                                <div className="flex-1 min-w-[150px]">
                                    <select
                                        value={item.type}
                                        onChange={(e) => updateProposalItem(index, 'type', e.target.value)}
                                        className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs"
                                    >
                                        {getProductTypes().map((pt: any) => (
                                            <option key={pt.code} value={pt.code}>{pt.code} - {pt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.weekLayout || ''}
                                    onChange={(e) => updateProposalItem(index, 'weekLayout', e.target.value)}
                                    className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs text-center"
                                    placeholder="Dönem"
                                />
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateProposalItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-14 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs"
                                    placeholder="Adet"
                                    readOnly={(item.type === 'BB' || item.type === 'GB') && !!item.network}
                                    min="0"
                                />
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateProposalItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs"
                                    placeholder="Birim"
                                />
                                <input
                                    type="number"
                                    value={item.discountedPrice || 0}
                                    onChange={(e) => updateProposalItem(index, 'discountedPrice', parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-2 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs font-medium text-blue-700"
                                    placeholder="İndirim"
                                />
                                <input
                                    type="number"
                                    value={item.printingCost}
                                    onChange={(e) => updateProposalItem(index, 'printingCost', parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs"
                                    placeholder="Baskı"
                                />
                                <input
                                    type="number"
                                    value={item.operationCost}
                                    onChange={(e) => updateProposalItem(index, 'operationCost', parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-xs"
                                    placeholder="Op."
                                />
                                <span className="w-28 text-right font-bold text-gray-900 text-xs">
                                    ₺{(() => {
                                        const period = parseInt(item.weekLayout || '1') || 1
                                        const price = (item.discountedPrice && item.discountedPrice > 0) ? item.discountedPrice : item.unitPrice
                                        return ((item.quantity * price * period) + (item.quantity * item.printingCost) + (item.quantity * item.operationCost)).toLocaleString()
                                    })()}
                                </span>
                                {proposalItems.length > 1 && (
                                    <button
                                        onClick={() => removeProposalItem(index)}
                                        className="w-8 flex items-center justify-center text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Blok Liste Seçeneği */}
                    <div className="space-y-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="blockList"
                                checked={isBlockList}
                                onChange={(e) => setIsBlockList(e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="blockList" className="text-sm text-gray-700 font-bold">
                                Blok Liste Uygula
                            </label>
                        </div>

                        {isBlockList && (
                            <div className="flex items-center gap-4 pl-7 pt-2 border-t border-yellow-200">
                                <div className="flex-1">
                                    <p className="text-xs text-yellow-800 mb-1">Operasyon maliyeti tüm ürünlerin birim operasyon bedellerinin toplamı üzerinden hesaplanır.</p>
                                    <p className="text-sm font-medium text-yellow-900">Operasyon Adeti:</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={blockOperationQuantity}
                                        onChange={(e) => setBlockOperationQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 px-3 py-1.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                                    />
                                    <span className="text-sm text-yellow-800 font-medium">Kez</span>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* KDV Seçimi */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">KDV Oranı:</span>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="kdvRate"
                                    value="20"
                                    checked={kdvRate === 20}
                                    onChange={() => setKdvRate(20)}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">%20</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="kdvRate"
                                    value="14"
                                    checked={kdvRate === 14}
                                    onChange={() => setKdvRate(14)}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">%14</span>
                            </label>
                        </div>
                    </div>

                    {/* Detaylı Hesaplama */}
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ürün Bedeli:</span>
                            <span className="font-medium">₺{calculateProductTotal(proposalItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Baskı Bedeli:</span>
                            <span className="font-medium text-blue-600">₺{calculatePrintingTotal(proposalItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                Operasyon Maliyeti {isBlockList ? '(Blok)' : '(Adet Başı)'}:
                            </span>
                            <span className="font-medium text-orange-600">₺{calculateOperationTotal(proposalItems, isBlockList, blockOperationQuantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                            <span className="text-gray-600">Ara Toplam:</span>
                            <span className="font-medium">₺{calculateSubtotal(proposalItems, isBlockList, blockOperationQuantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">KDV (%{kdvRate}):</span>
                            <span className="font-medium">₺{calculateKDV(proposalItems, isBlockList, blockOperationQuantity, kdvRate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-primary-50 rounded-lg p-3 -mx-2">
                            <span className="text-lg font-semibold text-gray-900">GENEL TOPLAM:</span>
                            <span className="text-2xl font-bold text-primary-600">₺{calculateGrandTotal(proposalItems, isBlockList, blockOperationQuantity, kdvRate).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3 justify-end shrink-0">
                    <button
                        onClick={() => setShowProposalModal(false)}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => {
                            const confirmed = window.confirm(
                                `${selectedCustomer?.companyName} için hazırlanan bütçe teklifi: \n\n` +
                                `Toplam: ₺${calculateGrandTotal(proposalItems, isBlockList, blockOperationQuantity, kdvRate).toLocaleString()} \n` +
                                `Süre: ${durationWeeks} Hafta\n\n` +
                                `Bu teklifi onaylayıp müşteriye e - posta ile göndermek istiyor musunuz ? `
                            );
                            if (confirmed) {
                                setShowProposalModal(false)
                                setShowEmailModal(true)
                            }
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Onaya Gönder
                    </button>
                </div>
            </div>
        </div>
    )
}
