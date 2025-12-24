import { useRef, useState } from 'react'
import { X, Printer, Download, Mail, Check, Loader2 } from 'lucide-react'
import type { Proposal } from '../../services/proposalsService'
import { proposalsService } from '../../services/proposalsService'
import { useToast } from '../../hooks/useToast'

interface ProposalContractModalProps {
    isOpen: boolean
    onClose: () => void
    proposal: Proposal | null
    onStatusUpdate?: (id: string, status: string) => void
}

export default function ProposalContractModal({ isOpen, onClose, proposal, onStatusUpdate }: ProposalContractModalProps) {
    const printRef = useRef<HTMLDivElement>(null)
    const [isSending, setIsSending] = useState(false)
    const { success, error } = useToast()

    if (!isOpen || !proposal) return null

    const handlePrint = () => {
        const printContent = printRef.current
        if (printContent) {
            const originalContents = document.body.innerHTML
            document.body.innerHTML = printContent.innerHTML
            window.print()
            document.body.innerHTML = originalContents
            window.location.reload()
        }
    }

    const handleSendEmail = async () => {
        if (!proposal) return

        const targetEmail = proposal.client?.contact_email || proposal.client?.email

        if (!targetEmail) {
            error('Müşterinin kayıtlı e-posta adresi bulunamadı. Lütfen müşteri kartını güncelleyin.')
            return
        }

        try {
            setIsSending(true)

            // Real status update in backend
            await proposalsService.updateStatus(proposal.id, 'SENT')

            if (onStatusUpdate) {
                onStatusUpdate(proposal.id, 'SENT')
            }

            success(`Teklif başarıyla ${targetEmail} adresine gönderildi`)
        } catch (err: any) {
            console.error('Failed to send email:', err)
            error(err.message || 'E-posta gönderilirken bir hata oluştu')
        } finally {
            setIsSending(false)
        }
    }

    const companyInfo = {
        name: 'İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.',
        address: 'MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR',
        phone: '0232 431 00 75',
        taxOffice: 'KARŞIYAKA',
        taxNo: '6490546546'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-600 p-1 rounded">
                            <span className="text-white font-bold text-xs">İAR</span>
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Teklif Önizleme</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <button
                                onClick={handleSendEmail}
                                disabled={isSending}
                                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed group relative"
                                title={proposal.status === 'SENT' ? 'Tekrar Gönder' : 'E-posta Gönder'}
                            >
                                {isSending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : proposal.status === 'SENT' ? (
                                    <Check className="w-3.5 h-3.5 text-white" />
                                ) : (
                                    <Mail className="w-3.5 h-3.5" />
                                )}
                                {isSending ? 'GÖNDERİLİYOR...' : proposal.status === 'SENT' ? 'TEKRAR GÖNDER' : 'E-POSTA GÖNDER'}
                            </button>
                            {proposal.client && (proposal.client.contact_email || proposal.client.email) && (
                                <span className="text-[9px] text-gray-500 mt-0.5 font-bold tracking-tight bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                    ALICI: {proposal.client.contact_email || proposal.client.email}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-bold"
                        >
                            <Printer className="w-4 h-4" />
                            YAZDIR / PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Contract Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-200">
                    <div ref={printRef} className="bg-white shadow-2xl mx-auto p-[20mm] text-black" style={{ width: '210mm', minHeight: '297mm' }}>
                        {/* Letterhead */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-600 p-4 rounded-lg">
                                    <span className="text-white font-black text-4xl leading-none">İAR</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-red-600 tracking-tighter leading-none">İZMİR AÇIK HAVA</h1>
                                    <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">REKLAM AJANSAI</p>
                                </div>
                            </div>
                            <div className="text-right text-[9px] font-bold text-gray-600 space-y-1">
                                <p>{companyInfo.name}</p>
                                <p>{companyInfo.address}</p>
                                <p>TEL: {companyInfo.phone} | V.D: {companyInfo.taxOffice} - V.N: {companyInfo.taxNo}</p>
                            </div>
                        </div>

                        {/* Title Bar */}
                        <div className="bg-red-600 text-white text-center py-2 px-4 mb-8">
                            <h2 className="text-lg font-black uppercase tracking-widest">AÇIK HAVA REKLAM BÜTÇESİ</h2>
                        </div>

                        {/* Info Section */}
                        <div className="grid grid-cols-2 gap-10 mb-8 text-[11px]">
                            <div className="space-y-2">
                                <div className="flex border-b border-gray-100 py-1">
                                    <span className="w-24 font-bold text-red-700">MÜŞTERİ:</span>
                                    <span className="font-bold uppercase tracking-tight">{proposal.client?.company_name || proposal.client?.name}</span>
                                </div>
                                <div className="flex border-b border-gray-100 py-1">
                                    <span className="w-24 font-bold text-red-700">KAMPANYA:</span>
                                    <span className="uppercase">{proposal.title}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex border-b border-gray-100 py-1">
                                    <span className="w-24 font-bold text-red-700">TEKLİF NO:</span>
                                    <span className="font-mono">{proposal.proposal_number}</span>
                                </div>
                                <div className="flex border-b border-gray-100 py-1">
                                    <span className="w-24 font-bold text-red-700">TARİH:</span>
                                    <span>{new Date(proposal.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <table className="w-full border-collapse mb-10 text-[10px]">
                            <thead>
                                <tr className="bg-red-600 text-white font-bold uppercase text-center border-b-2 border-red-800">
                                    <th className="p-2 border border-red-700">ŞEHİR / İLÇE</th>
                                    <th className="p-2 border border-red-700">ÜRÜN</th>
                                    <th className="p-2 border border-red-700">ÖLÇÜ</th>
                                    <th className="p-2 border border-red-700">ADET</th>
                                    <th className="p-2 border border-red-700">SÜRE</th>
                                    <th className="p-2 border border-red-700">DÖNEM</th>
                                    <th className="p-2 border border-red-700">BİRİM FİYAT</th>
                                    <th className="p-2 border border-red-700">TOPLAM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposal.items?.map((item, index) => {
                                    const metadata = (item as any).metadata || {};
                                    return (
                                        <tr key={index} className="text-center font-bold border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 border-x border-gray-200 uppercase">{metadata.district || 'İZMİR'}</td>
                                            <td className="p-3 border-x border-gray-200 text-left">
                                                <div className="font-black text-red-600">{item.description.split(' - ')[0]}</div>
                                                <div className="text-[9px] text-gray-500 font-normal">{item.description.split(' - ')[1] || ''}</div>
                                            </td>
                                            <td className="p-3 border-x border-gray-200">{metadata.measurements || '—'}</td>
                                            <td className="p-3 border-x border-gray-200">{item.quantity}</td>
                                            <td className="p-3 border-x border-gray-200">{metadata.duration || '1'} {
                                                metadata.period?.includes('HAFTA') ? 'Hafta' :
                                                    metadata.period?.includes('GÜN') ? 'Gün' :
                                                        'Ay'
                                            }</td>
                                            <td className="p-3 border-x border-gray-200 text-[9px] font-normal">{metadata.period || 'HAFTALIK'}</td>
                                            <td className="p-3 border-x border-gray-200">₺{item.unit_price.toLocaleString('tr-TR')}</td>
                                            <td className="p-3 border-x border-gray-200 font-black text-red-600 bg-red-50/30">₺{(item.total || 0).toLocaleString('tr-TR')}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="flex justify-end mb-16">
                            <div className="w-1/2 space-y-1">
                                <div className="flex">
                                    <div className="flex-1 bg-black text-white p-2 font-black text-xs uppercase tracking-tighter">ARA TOPLAM (KDV HARİÇ)</div>
                                    <div className="w-32 border border-black p-2 text-right font-black text-xs">₺{proposal.subtotal.toLocaleString('tr-TR')}</div>
                                </div>
                                <div className="flex text-gray-600">
                                    <div className="flex-1 border border-gray-200 p-2 font-bold text-xs">KDV (%{proposal.tax_rate})</div>
                                    <div className="w-32 border border-gray-200 p-2 text-right font-bold text-xs">₺{proposal.tax_amount.toLocaleString('tr-TR')}</div>
                                </div>
                                <div className="flex pt-1">
                                    <div className="flex-1 bg-red-600 text-white p-3 font-black text-sm uppercase">GENEL TOPLAM</div>
                                    <div className="w-32 bg-red-600 text-white p-3 text-right font-black text-lg">₺{proposal.total.toLocaleString('tr-TR')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Legal Conditions */}
                        <div className="bg-gray-50 p-6 rounded-lg text-[9px] text-gray-600 italic leading-relaxed border border-gray-200 mb-16">
                            <p className="font-bold text-red-700 uppercase mb-2 not-italic">Önemli Notlar ve Koşullar:</p>
                            {proposal.terms || 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir.'}
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-20">
                            <div className="text-center">
                                <div className="font-black text-red-600 text-xs mb-10 border-b border-black pb-2 uppercase italic">KİRALAYAN (İAR)</div>
                                <div className="text-[10px] text-gray-400">İmza / Kaşe</div>
                            </div>
                            <div className="text-center">
                                <div className="font-black text-gray-800 text-xs mb-10 border-b border-black pb-2 uppercase italic">KİRACI (ONAY)</div>
                                <div className="text-[10px] text-gray-400">İmza / Kaşe</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
