import { useRef, useState } from 'react'
import { X, Printer, Download, Mail, Check, Loader2, AlertCircle } from 'lucide-react'
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
    const [contractType, setContractType] = useState<'standard' | 'tevkifat'>('standard')
    const [isSending, setIsSending] = useState(false)
    const [selectedSender, setSelectedSender] = useState('pazarlama@izmiracikhavareklam.com')
    const { success, error } = useToast()

    const SENDER_EMAILS = [
        { label: 'Pazarlama', email: 'pazarlama@izmiracikhavareklam.com' },
        { label: 'Rezervasyon', email: 'rezervasyon@izmiracikhavareklam.com' },
        { label: 'Simge', email: 'simge@izmiracikhavareklam.com' },
        { label: 'Ali Çınar', email: 'ali@izmiracikhavareklam.com' },
        { label: 'Ayşe', email: 'ayse@izmiracikhavareklam.com' },
    ]

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

            // Send real email via backend
            await proposalsService.sendEmail(proposal.id, targetEmail, undefined, selectedSender);

            if (onStatusUpdate) {
                onStatusUpdate(proposal.id, 'SENT')
            }

            success(`Teklif başarıyla ${targetEmail} adresine ${selectedSender} üzerinden gönderildi`)
        } catch (err: any) {
            console.error('Failed to send email:', err)
            error(err.message || 'E-posta gönderilirken bir hata oluştu')
        } finally {
            setIsSending(false)
        }
    }

    const companyInfo = {
        name: import.meta.env.VITE_COMPANY_NAME || 'İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.',
        address: import.meta.env.VITE_COMPANY_ADDRESS || 'MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR',
        phone: import.meta.env.VITE_COMPANY_PHONE || '0232 431 0 75',
        fax: import.meta.env.VITE_COMPANY_FAX || '0232 431 00 73',
        taxOffice: import.meta.env.VITE_COMPANY_TAX_OFFICE || 'KARŞIYAKA V.D.',
        taxNo: import.meta.env.VITE_COMPANY_TAX_NO || '6490546546'
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
                    <div className="flex items-center gap-3">
                        {/* Sender Selection */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Gönderen:</span>
                            <select
                                value={selectedSender}
                                onChange={(e) => setSelectedSender(e.target.value)}
                                className="text-[11px] font-bold text-gray-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer outline-none"
                            >
                                {SENDER_EMAILS.map(s => (
                                    <option key={s.email} value={s.email}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex bg-gray-200 p-1 rounded-lg">
                            <button
                                onClick={() => setContractType('standard')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${contractType === 'standard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                STANDART
                            </button>
                            <button
                                onClick={() => setContractType('tevkifat')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${contractType === 'tevkifat' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                TEVKİFATLI
                            </button>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSendEmail}
                                    disabled={isSending}
                                    className="p-2.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group relative shadow-sm"
                                    title={proposal.status === 'SENT' ? 'Tekrar Gönder' : 'E-posta Gönder'}
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Mail className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="p-2.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center shadow-sm"
                                    title="Yazdır / PDF"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-col items-end gap-1 mt-1">
                                {proposal.client && (proposal.client.contact_email || proposal.client.email) && (
                                    <span className="text-[9px] text-gray-500 font-bold tracking-tight bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                        ALICI: {proposal.client.contact_email || proposal.client.email}
                                    </span>
                                )}
                                <span className="text-[9px] text-red-600 font-bold tracking-tight bg-red-50 px-1.5 py-0.5 rounded uppercase border border-red-100">
                                    BCC: Rezervasyon@izmiracikhavareklam.com
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-2"
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
                                <p>TEL: {companyInfo.phone} FAKS: {companyInfo.fax} | V.D: {companyInfo.taxOffice} - V.N: {companyInfo.taxNo}</p>
                            </div>
                        </div>

                        {/* Title Bar */}
                        <div className="text-center mb-8">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 leading-tight">REKLAM YERİ KULLANIM SÖZLEŞMESİ</h2>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700">BÖLÜM A ÖZEL HÜKÜMLER</h3>
                        </div>

                        {/* Info Section */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-8 text-[10px]">
                            <div className="space-y-1">
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">SÖZLEŞME NO</span>
                                    <span className="flex-1">: IAR {proposal.proposal_number.split('-').pop()}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">KİRALAYAN</span>
                                    <span className="flex-1 tracking-tight">: {companyInfo.name}</span>
                                </div>
                                <div className="mt-4 pt-4"></div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">KİRACI</span>
                                    <span className="flex-1 font-black">: {proposal.client?.company_name || proposal.client?.name}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase italic text-[9px]"></span>
                                    <span className="flex-1 text-gray-600 border-b border-gray-100 pb-1">: {proposal.client?.address || '—'}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex gap-4 pt-[72px]">
                                    <span className="w-32 font-bold text-gray-900 uppercase">KİRACI TEL / FAX</span>
                                    <span className="flex-1">: {proposal.client?.phone || '—'}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">KİRACI VD. / NO</span>
                                    <span className="flex-1">: {proposal.client?.tax_office || '—'} VD / {proposal.client?.tax_no || '—'}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">MARKA-ÜRÜN</span>
                                    <span className="flex-1">: {proposal.title}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">KAMPANYA</span>
                                    <span className="flex-1">: {proposal.description || 'GENEL KAMPANYA'}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="w-32 font-bold text-gray-900 uppercase">REZERVASYON TARİHİ</span>
                                    <span className="flex-1">: {new Date(proposal.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="mb-4">
                            <h4 className="text-[11px] font-black text-center uppercase mb-2 border-y-2 border-gray-900 py-1.5 tracking-tighter">TEKLİF İÇERİĞİ</h4>
                        </div>
                        <table className="w-full border-collapse mb-10 text-[10px]">
                            <thead>
                                <tr className="bg-red-600 text-white font-bold uppercase text-center border-b-2 border-red-800">
                                    <th className="p-2 border border-red-700 w-[30%]">ÜRÜN</th>
                                    <th className="p-2 border border-red-700">ADET</th>
                                    <th className="p-2 border border-red-700">DÖNEM</th>
                                    <th className="p-2 border border-red-700">GÜN</th>
                                    <th className="p-2 border border-red-700">BAŞLANGIÇ</th>
                                    <th className="p-2 border border-red-700">BİTİŞ</th>
                                    <th className="p-2 border border-red-700">BİRİM FİYATI</th>
                                    <th className="p-2 border border-red-700">TOPLAM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposal.items?.map((item, index) => {
                                    const metadata = (item as any).metadata || {};
                                    return (
                                        <tr key={index} className="text-center font-bold border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 border-x border-gray-100 text-left font-black uppercase text-gray-800">{item.description.split(' - ')[0]}</td>
                                            <td className="p-3 border-x border-gray-100">{item.quantity}</td>
                                            <td className="p-3 border-x border-gray-100">{metadata.duration || '1'}</td>
                                            <td className="p-3 border-x border-gray-100">{metadata.days || '—'}</td>
                                            <td className="p-3 border-x border-gray-100">{metadata.start_date || '—'}</td>
                                            <td className="p-3 border-x border-gray-100">{metadata.end_date || '—'}</td>
                                            <td className="p-3 border-x border-gray-100">₺{item.unit_price.toLocaleString('tr-TR')}</td>
                                            <td className="p-3 border-x border-gray-100 font-black text-gray-900 bg-gray-50/50">₺{(item.total || 0).toLocaleString('tr-TR')}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="flex justify-end mb-16 px-1">
                            <div className="w-[340px] space-y-1">
                                <div className="flex">
                                    <div className="flex-1 bg-gray-900 text-white p-2.5 font-bold text-[11px] uppercase tracking-wider flex items-center">KDV HARİÇ TUTAR</div>
                                    <div className="w-36 border-2 border-gray-900 p-2 text-right font-black text-xs flex items-center justify-end">
                                        ₺{proposal.subtotal.toLocaleString('tr-TR')}
                                    </div>
                                </div>

                                {contractType === 'tevkifat' && (
                                    <div className="flex text-red-700 bg-red-50/50">
                                        <div className="flex-1 border border-red-200 p-2 font-bold text-[11px] uppercase tracking-wider flex items-center italic">TEVKİFAT (3/10)</div>
                                        <div className="w-36 border border-red-200 p-2 text-right font-bold text-xs flex items-center justify-end italic">
                                            - ₺{(proposal.tax_amount * 0.3).toLocaleString('tr-TR')}
                                        </div>
                                    </div>
                                )}

                                <div className="flex text-gray-700">
                                    <div className="flex-1 border border-gray-200 p-2 font-bold text-[11px] uppercase tracking-wider flex items-center">KDV (%{proposal.tax_rate})</div>
                                    <div className="w-36 border border-gray-200 p-2 text-right font-bold text-xs flex items-center justify-end">
                                        ₺{proposal.tax_amount.toLocaleString('tr-TR')}
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="flex-1 bg-gray-100 border border-gray-300 p-2 font-bold text-[11px] uppercase tracking-wider flex items-center text-gray-800">TOPLAM (KDV DAHİL)</div>
                                    <div className="w-36 border border-gray-300 bg-gray-50 p-2 text-right font-black text-xs flex items-center justify-end">
                                        ₺{proposal.total.toLocaleString('tr-TR')}
                                    </div>
                                </div>

                                {contractType === 'tevkifat' ? (
                                    <div className="flex pt-1.5">
                                        <div className="flex-1 bg-red-600 text-white p-3.5 font-black text-[13px] uppercase tracking-widest flex items-center shadow-sm">ÖDENECEK TUTAR</div>
                                        <div className="w-36 bg-red-600 text-white p-3.5 text-right font-black text-xl flex items-center justify-end shadow-sm">
                                            ₺{(proposal.total - (proposal.tax_amount * 0.3)).toLocaleString('tr-TR')}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex pt-1.5">
                                        <div className="flex-1 bg-red-600 text-white p-3.5 font-black text-[13px] uppercase tracking-widest flex items-center shadow-sm">GENEL TOPLAM</div>
                                        <div className="w-36 bg-red-600 text-white p-3.5 text-right font-black text-xl flex items-center justify-end shadow-sm">
                                            ₺{proposal.total.toLocaleString('tr-TR')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Legal Conditions */}
                        <div className="bg-gray-50 p-6 rounded-lg text-[10px] text-gray-700 italic leading-relaxed border border-gray-200 mb-16 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${contractType === 'tevkifat' ? 'bg-red-600' : 'bg-gray-400'}`}></div>
                            <p className="font-bold text-gray-900 uppercase mb-2 not-italic flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                Önemli Notlar ve Koşullar:
                            </p>
                            {contractType === 'tevkifat' ? (
                                <div className="space-y-2">
                                    <p className="font-black text-red-700">311 Seri No.lu Katma Değer Vergisi Genel Uygulama Tebliği uyarınca Ticari Reklam Hizmetleri kapsamında 3/10 oranında KDV Tevkifatı uygulanmaktadır.</p>
                                    <p>{proposal.terms || 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir.'}</p>
                                </div>
                            ) : (
                                <p>{proposal.terms || 'Teklifimize ilan reklam vergileri dahil, KDV hariçtir. Her türlü iptal talebi, en geç kampanya başlangıç tarihine 20 gün kala bildirilmelidir.'}</p>
                            )}
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
