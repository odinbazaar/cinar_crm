import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
    ShoppingBag,
    TrendingUp,
    DollarSign,
    Users,
    Plus,
    Search,
    Filter,
    UserPlus,
    FileText,
    Send,
    Mail,
    X,
    Check,
    Building2,
    Phone,
    MapPin,
    Building,
    StickyNote,
    Save,
    Hash,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    RefreshCw,
    CheckCircle,
    Loader2,
    Trash2,
    LayoutGrid,
    List,
    Calendar,
    Bell,
    Clock,
    RefreshCw as RefreshIcon
} from 'lucide-react'
import LocationRequestModal from '../components/proposals/LocationRequestModal'
import ProposalContractModal from '../components/proposals/ProposalContractModal'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { clientsService } from '../services/clientsService'
import { proposalsService } from '../services/proposalsService'
import { customerRequestsService } from '../services/customerRequestsService'
import { incomingCallsService, type IncomingCall } from '../services/incomingCallsService'
import { inventoryService, type InventoryItem } from '../services/inventoryService'

import type { 
    Customer, 
    CustomerForm, 
    ProposalItem, 
    Proposal, 
    CustomerRequest 
} from '../types/sales'

import { 
    STORAGE_KEY,
    getProductTypes,
    calculateProductTotal,
    calculatePrintingTotal,
    calculateOperationTotal,
    calculateSubtotal,
    calculateKDV,
    calculateGrandTotal,
    monthNames,
    getWeeksInMonth,
    getWeekStartDate,
    getWeekRangeText,
    calculateTotalWeeks,
    formatWeekDate
} from '../utils/salesUtils'

import { CustomerModal } from '../components/sales/CustomerModal'
import { ProposalModal } from '../components/sales/ProposalModal'
import { EmailModal } from '../components/sales/EmailModal'
import { CustomerRequestModal } from '../components/sales/CustomerRequestModal'
import { SalesStats } from '../components/sales/SalesStats'
import { CustomerList } from '../components/sales/CustomerList'
import { ProposalList } from '../components/sales/ProposalList'
import { MainProposalCard } from '../components/sales/MainProposalCard'
import { ApproveProposalModal } from '../components/sales/ApproveProposalModal'


export default function SalesPage() {
    const { isAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState<'customers' | 'proposals' | 'sent' | 'reservations'>('customers')
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [showProposalModal, setShowProposalModal] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [showReservationModal, setShowReservationModal] = useState(false)
    const [showApproveModal, setShowApproveModal] = useState(false)
    const [showLocationListModal, setShowLocationListModal] = useState(false)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [isContractModalOpen, setIsContractModalOpen] = useState(false)
    const { success, info } = useToast()
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [networkCounts, setNetworkCounts] = useState<Record<string, Record<string, number>>>({})
    const [pendingIncomingCallId, setPendingIncomingCallId] = useState<string | null>(null)
    const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([])
    const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
    const [selectedSenderEmail, setSelectedSenderEmail] = useState('pazarlama@izmiracikhavareklam.com')
    const [customerViewType, setCustomerViewType] = useState<'grid' | 'table'>('grid')
    const location = useLocation()

    // Tanımlı e-posta hesapları
    const emailAccounts = [
        { value: 'pazarlama@izmiracikhavareklam.com', label: 'Pazarlama', color: 'green' },
        { value: 'rezervasyon@izmiracikhavareklam.com', label: 'Rezervasyon', color: 'blue' },
        { value: 'simge@izmiracikhavareklam.com', label: 'Simge', color: 'purple' },
        { value: 'ali@izmiracikhavareklam.com', label: 'Ali Çınar', color: 'orange' },
        { value: 'ayse@izmiracikhavareklam.com', label: 'Ayşe', color: 'pink' }
    ]

    // Fetch data on mount
    useEffect(() => {
        fetchData()

        // Handle prefill from IncomingCallsPage
        const state = location.state as any
        if (state?.prefill) {
            const { prefill } = state
            setCustomerForm({
                companyName: prefill.companyName || '',
                tradeName: '',
                sector: '',
                taxOffice: '',
                taxNumber: '',
                status: 'Potansiyel',
                address: '',
                city: '',
                district: '',
                postalCode: '',
                contactPerson: prefill.contactPerson || '',
                email: prefill.email || '',
                phone: prefill.phone || '',
                mobile: '',
                website: '',
                notes: prefill.notes || '',
                requestDetail: prefill.requestDetail || '',
                calledPhone: prefill.calledPhone || '',
                leadSource: '',
                leadStage: 'Aday'
            })
            setPendingIncomingCallId(prefill.incomingCallId)
            setShowCustomerModal(true)
            setCustomerModalTab('company')

            // Clear state so it doesn't reopen on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [clientsData, proposalsData, requestsData] = await Promise.all([
                clientsService.getAll(),
                proposalsService.getAll(),
                customerRequestsService.getAll()
            ])

            // Map backend clients to local Customer type
            const mappedCustomers: Customer[] = clientsData.map(c => ({
                id: c.id,
                companyName: c.company_name || (c as any).name || 'İsimsiz Şirket',
                contactPerson: c.contact_person || '-',
                email: c.email || '-',
                phone: c.phone || '-',
                address: c.address || '-',
                tradeName: (c as any).trade_name || '',
                sector: (c as any).sector || '',
                taxOffice: (c as any).tax_office || '',
                taxNumber: (c as any).tax_number || '',
                status: (c as any).status === 'active' ? 'Aktif' : (c as any).status === 'inactive' ? 'Pasif' : 'Potansiyel',
                city: (c as any).city || '',
                district: (c as any).district || '',
                postalCode: (c as any).postal_code || '',
                mobile: (c as any).mobile || '',
                website: (c as any).website || '',
                notes: (c as any).notes || '',
                requestDetail: (c as any).request_detail || '',
                calledPhone: (c as any).called_phone || '',
                leadSource: (c as any).lead_source || '',
                leadStage: (c as any).lead_stage || 'Aday',
                createdAt: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
            }))
            setCustomers(mappedCustomers)

            // Map backend proposals to local Proposal type
            const mappedProposals: Proposal[] = proposalsData.map(p => {
                let usagePeriod = '1 Hafta';
                let weekInfo = '';
                let isBlockList = false;

                const items = (p as any).items?.map((item: any) => {
                    const desc = item.description || '';

                    // Extract duration (Örn: "(2 Hafta)")
                    const durMatch = desc.match(/\((\d+)\s*Hafta\)/);
                    if (durMatch) usagePeriod = `${durMatch[1]} Hafta`;

                    // Detect block list
                    if (desc.includes('Blok Liste')) isBlockList = true;

                    const pTypes = getProductTypes();
                    let itemType = 'BB';

                    // Daha hassas eşleştirme için önce ürün ismine göre bakıyoruz (açıklama ürün ismiyle başlar)
                    const matchByName = pTypes.find((pt: any) => desc.startsWith(pt.name));
                    if (matchByName) {
                        itemType = matchByName.code;
                    } else {
                        // İsme göre bulunamadıysa koda göre bakıyoruz
                        const matchByCode = pTypes.find((pt: any) => desc.includes(pt.code));
                        if (matchByCode) {
                            itemType = matchByCode.code;
                        } else {
                            // Manuel kontroller (ek koruma ve geriye dönük uyumluluk için)
                            if (desc.includes('CLP') || desc.includes('City Light')) itemType = 'CLP';
                            else if (desc.includes('Megalight') || desc.includes('MGL') || desc.includes('ML')) itemType = 'MGL';
                            else if (desc.includes('Giantboard') || desc.includes('GB')) itemType = 'GB';
                            else if (desc.includes('Billboard') || desc.includes('BB')) itemType = 'BB';
                            else if (desc.includes('Megaboard') || desc.includes('MB')) itemType = 'MB';
                            else if (desc.includes('Kuleboard') || desc.includes('KB')) itemType = 'KB';
                            else if (desc.includes('LED') || desc.includes('LB')) itemType = 'LB';
                        }
                    }

                    let network = '';
                    const netMatch = desc.match(/Network\s*(\d+|BLD)/i);
                    if (netMatch) network = netMatch[1];

                    return {
                        type: itemType,
                        code: desc.split(' (')[0], // Clean description for the select box
                        quantity: item.quantity,
                        unitPrice: item.unit_price,
                        operationCost: 0,
                        network: network
                    };
                }).filter((item: any) => !item.code.includes('Operasyon Maliyeti')) || [];

                return {
                    id: p.id,
                    proposalNumber: p.proposal_number,
                    customerId: p.client_id,
                    customerName: p.client?.company_name || 'Bilinmeyen Müşteri',
                    items: items,
                    totalAmount: p.subtotal || 0,
                    operationTotal: 0,
                    kdvAmount: p.tax_amount || 0,
                    grandTotal: p.total || 0,
                    isBlockList: isBlockList,
                    usagePeriod: usagePeriod,
                    weekInfo: p.description || '', // We'll start storing weekRangeText in description
                    status: (p.status?.toLowerCase() === 'sent' ? 'sent' :
                        p.status?.toLowerCase() === 'approved' ? 'approved' :
                            p.status?.toLowerCase() === 'rejected' ? 'rejected' : 'draft') as any,
                    createdAt: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                    sentAt: p.sent_at?.split('T')[0]
                };
            })
            setProposals(mappedProposals)

            // Map backend requests to local CustomerRequest type
            const mappedRequests: CustomerRequest[] = requestsData.map(r => {
                let bn = '';
                try {
                    const notes = JSON.parse((r as any).notes || '{}');
                    bn = notes.brandName || '';
                } catch (e) { }

                return {
                    id: (r as any).id,
                    requestNumber: (r as any).request_number,
                    customerId: (r as any).client_id,
                    customerName: (r as any).client?.company_name || bn || 'Bilinmeyen Müşteri',
                    productType: (r as any).product_type,
                    productDetails: (r as any).product_details || '',
                    quantity: (r as any).quantity,
                    notes: (r as any).notes || '',
                    budgetSource: '',
                    status: (r as any).status as any,
                    createdAt: (r as any).created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                    brandName: bn
                };
            })
            setCustomerRequests(mappedRequests)

            // Fetch inventory and calculate network counts by type
            const inventory = await inventoryService.getAll()
            const counts: Record<string, Record<string, number>> = {}
            inventory.forEach(item => {
                if (item.network) {
                    if (!counts[item.type]) counts[item.type] = {}
                    counts[item.type][item.network] = (counts[item.type][item.network] || 0) + 1
                }
            })
            setNetworkCounts(counts)

            // Fetch incoming calls (Arayan Firmalar)
            const callsData = await incomingCallsService.getAll()
            setIncomingCalls(callsData)
        } catch (error) {
            console.error('Data fetch error:', error)
            info('Veriler sunucudan alınırken bir hata oluştu.')
        } finally {
            setIsLoading(false)
        }
    }

    // Form states
    const [customerModalTab, setCustomerModalTab] = useState<'company' | 'address' | 'contact' | 'notes' | 'crm'>('company')
    const [customerForm, setCustomerForm] = useState<CustomerForm>({
        companyName: '',
        tradeName: '',
        sector: '',
        taxOffice: '',
        taxNumber: '',
        status: 'Potansiyel',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        contactPerson: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        notes: '',
        requestDetail: '',
        calledPhone: '',
        leadSource: '',
        leadStage: 'Aday'
    })
    const [requestForm, setRequestForm] = useState({
        customerId: '',
        taxNumber: '',
        productType: 'Billboard',
        productDetails: '',
        quantity: 1,
        notes: '',
        budgetSource: ''
    })

    // Note states
    const [noteInput, setNoteInput] = useState({
        content: '',
        date: new Date().toISOString().split('T')[0],
        reminderDate: '',
        reminderTime: '10:00',
        repeat: false
    })
    const [noteFilterDate, setNoteFilterDate] = useState('')

    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([
        { type: 'BB', code: 'Billboard', quantity: 1, unitPrice: 6500, printingCost: 400, operationCost: 500, network: '', weekLayout: '1', opQty: 1 }
    ])
    const [isBlockList, setIsBlockList] = useState(false)
    const [kdvRate, setKdvRate] = useState<20 | 14>(20)
    // Hafta bazlı tarih seçimi
    const [startMonth, setStartMonth] = useState(1)
    const [startWeek, setStartWeek] = useState(1)
    const [durationWeeks, setDurationWeeks] = useState(1)

    // Ana Teklif Kartı State'leri
    const [mainProposalItems, setMainProposalItems] = useState<ProposalItem[]>([])
    const [mainProposalIsBlock, setMainProposalIsBlock] = useState(false)
    const [mainProposalKdvRate, setMainProposalKdvRate] = useState<20 | 14>(20)

    // Örnek müşteriler
    const [customers, setCustomers] = useState<Customer[]>([
        {
            id: '1',
            companyName: 'ABC Reklam Ltd.',
            contactPerson: 'Ahmet Yılmaz',
            email: 'ahmet@abcreklam.com',
            phone: '+90 532 111 2233',
            address: 'Kadıköy, İstanbul',
            createdAt: '2026-01-05'
        },
        {
            id: '2',
            companyName: 'XYZ Medya A.Ş.',
            contactPerson: 'Mehmet Demir',
            email: 'mehmet@xyzmedya.com',
            phone: '+90 533 444 5566',
            address: 'Beşiktaş, İstanbul',
            createdAt: '2026-01-04'
        }
    ])

    // Örnek müşteri talepleri
    const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([
        {
            id: '1',
            requestNumber: 'TAL-001',
            customerId: '1',
            customerName: 'ABC Reklam Ltd.',
            productType: 'Billboard',
            productDetails: '20 adet Billboard, Karşıyaka bölgesi',
            quantity: 20,
            notes: 'Acil dönüş bekleniyor.',
            budgetSource: 'Genel Pazarlama',
            status: 'pending',
            createdAt: '2026-01-05'
        }
    ])

    // Örnek teklifler
    const [proposals, setProposals] = useState<Proposal[]>([
        {
            id: 'TKL-001',
            customerId: '1',
            customerName: 'ABC Reklam Ltd.',
            items: [
                { type: 'BB', code: 'Billboard', quantity: 20, unitPrice: 3500, operationCost: 400, printingCost: 400, weekLayout: '' },
                { type: 'GB', code: 'Giantboard', quantity: 4, unitPrice: 7500, operationCost: 600, printingCost: 4500, weekLayout: '' },
            ],
            totalAmount: 100000,
            operationTotal: 10400,
            kdvAmount: 22080,
            grandTotal: 132480,
            isBlockList: false,
            status: 'sent',
            createdAt: '2026-01-05',
            sentAt: '2026-01-05'
        },
        {
            id: 'TKL-002',
            customerId: '2',
            customerName: 'XYZ Medya A.Ş.',
            items: [
                { type: 'CLP', code: 'CLP Raket', quantity: 15, unitPrice: 1200, operationCost: 150, printingCost: 300, weekLayout: '' },
                { type: 'ML', code: 'Megalight', quantity: 3, unitPrice: 5000, operationCost: 500, printingCost: 1750, weekLayout: '' }
            ],
            totalAmount: 33000,
            operationTotal: 3750,
            kdvAmount: 7350,
            grandTotal: 44100,
            isBlockList: false,
            status: 'draft',
            createdAt: '2026-01-06'
        }
    ])

    // Yer Listesi Talepleri (Onaylanmış teklifler)
    interface LocationRequest {
        id: string
        proposalId: string
        customerName: string
        items: ProposalItem[]
        usageWeekStart: { month: number, week: number }
        usageWeekEnd: { month: number, week: number }
        reservationWeek: { month: number, week: number }
        status: 'pending' | 'inProgress' | 'completed'
        createdAt: string
        notes: string
    }

    const [locationRequests, setLocationRequests] = useState<LocationRequest[]>([
        {
            id: 'YL-001',
            proposalId: 'TKL-001',
            customerName: 'ABC Reklam Ltd.',
            items: [
                { type: 'BB', code: 'Billboard', quantity: 20, unitPrice: 3500, operationCost: 400, printingCost: 400, weekLayout: '' },
                { type: 'GB', code: 'Giantboard', quantity: 4, unitPrice: 7500, operationCost: 600, printingCost: 4500, weekLayout: '' },
            ],
            usageWeekStart: { month: 1, week: 2 },
            usageWeekEnd: { month: 1, week: 4 },
            reservationWeek: { month: 1, week: 1 },
            status: 'pending',
            createdAt: '2026-01-06',
            notes: ''
        },
        {
            id: 'YL-002',
            proposalId: 'TKL-003',
            customerName: 'DEF Holding A.Ş.',
            items: [
                { type: 'ML', code: 'Megalight', quantity: 10, unitPrice: 5000, operationCost: 500, printingCost: 1750, weekLayout: '' },
            ],
            usageWeekStart: { month: 2, week: 1 },
            usageWeekEnd: { month: 2, week: 3 },
            reservationWeek: { month: 1, week: 4 },
            status: 'inProgress',
            createdAt: '2026-01-05',
            notes: 'Özel konumlar belirlendi'
        }
    ])

    const [selectedLocationRequest, setSelectedLocationRequest] = useState<LocationRequest | null>(null)

    const addProposalItem = () => {
        const productTypes = getProductTypes()
        const defaultProduct = productTypes[0]
        setProposalItems([...proposalItems, {
            type: defaultProduct.code,
            code: defaultProduct.name,
            unitPrice: defaultProduct.unitPrice,
            discountedPrice: defaultProduct.discountedPrice || 0,
            printingCost: defaultProduct.printingCost,
            operationCost: defaultProduct.operationCost,
            quantity: 1,
            weekLayout: '1',
            opQty: 1
        }])
    }

    const removeProposalItem = (index: number) => {
        setProposalItems(proposalItems.filter((_, i) => i !== index))
    }

    const updateProposalItem = (index: number, field: keyof ProposalItem, value: any) => {
        const updated = [...proposalItems]
        const productTypes = getProductTypes()
        if (field === 'type') {
            const product = productTypes.find((p: any) => p.code === value)
            if (product) {
                updated[index] = {
                    ...updated[index],
                    type: product.code,
                    code: product.name,
                    unitPrice: product.unitPrice,
                    discountedPrice: product.discountedPrice || 0,
                    printingCost: product.printingCost,
                    operationCost: product.operationCost,
                    weekLayout: updated[index].weekLayout || '',
                    network: undefined,
                    quantity: (product.code === 'BB' || product.code === 'GB') ? 0 : updated[index].quantity
                }
            }
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }
        setProposalItems(updated)
    }

    const handleCreateRequest = async () => {
        if (!requestForm.customerId) {
            alert('Lütfen müşteri seçin!')
            return
        }

        try {
            await customerRequestsService.create({
                client_id: requestForm.customerId,
                product_type: 'billboard', // Map appropriately if UI supports it
                product_details: requestForm.productDetails,
                quantity: requestForm.quantity,
                notes: requestForm.notes,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +1 week
                priority: 'medium'
            })

            success('Müşteri talebi başarıyla oluşturuldu.')
            setShowRequestModal(false)
            fetchData() // Refresh data

            setRequestForm({
                customerId: '',
                taxNumber: '',
                productType: 'Billboard',
                productDetails: '',
                quantity: 1,
                notes: '',
                budgetSource: ''
            })
        } catch (error) {
            console.error('Request creation error:', error)
            alert('Talep oluşturulurken hata oluştu.')
        }
    }

    const handleSaveCustomer = async () => {
        if (!customerForm.companyName) {
            alert('Lütfen şirket unvanını girin!')
            return
        }

        try {
            const userId = localStorage.getItem('userId') || null

            const customerData = {
                company_name: customerForm.companyName,
                name: customerForm.companyName,
                trade_name: customerForm.tradeName,
                type: 'corporate',
                sector: customerForm.sector,
                tax_office: customerForm.taxOffice,
                tax_number: customerForm.taxNumber,
                status: customerForm.status === 'Aktif' ? 'active' : customerForm.status === 'Pasif' ? 'inactive' : 'potential',
                address: customerForm.address,
                city: customerForm.city,
                district: customerForm.district,
                postal_code: customerForm.postalCode,
                contact_person: customerForm.contactPerson,
                email: customerForm.email,
                phone: customerForm.phone,
                notes: customerForm.notes,
                request_detail: customerForm.requestDetail,
                called_phone: customerForm.calledPhone,
                lead_source: customerForm.leadSource,
                lead_stage: customerForm.leadStage,
                account_manager_id: userId
            }

            if (selectedCustomer) {
                await (clientsService as any).update(selectedCustomer.id, customerData)
                success('Müşteri başarıyla güncellendi.')
            } else {
                await (clientsService as any).create(customerData)

                // Eğer bu müşteri bir 'Arayan Firma' kaydından geliyorsa durumu güncelle
                if (pendingIncomingCallId) {
                    await incomingCallsService.updateStatus(pendingIncomingCallId, 'converted')
                    setPendingIncomingCallId(null)
                }

                success('Müşteri başarıyla kaydedildi.')
            }

            setShowCustomerModal(false)
            setSelectedCustomer(null)
            fetchData() // Refresh data

            setCustomerForm({
                companyName: '',
                tradeName: '',
                sector: '',
                taxOffice: '',
                taxNumber: '',
                status: 'Potansiyel',
                address: '',
                city: '',
                district: '',
                postalCode: '',
                contactPerson: '',
                email: '',
                phone: '',
                mobile: '',
                website: '',
                notes: '',
                requestDetail: '',
                calledPhone: '',
                leadSource: '',
                leadStage: 'Aday'
            })
            setCustomerModalTab('company')
        } catch (error) {
            console.error('Customer save error:', error)
            alert('Müşteri kaydedilirken hata oluştu.')
        }
    }

    // Hesaplama fonksiyonları
    const getWeekRangeVal = () => getWeekRangeText(startMonth, startWeek, durationWeeks)
    const subtotalVal = () => calculateSubtotal(proposalItems)
    const kdvVal = () => calculateKDV(proposalItems, kdvRate)
    const grandTotalVal = () => calculateGrandTotal(proposalItems, kdvRate)

    const handleSendEmail = async () => {
        try {
            setIsLoading(true);
            const emailInput = document.getElementById('recipientEmail') as HTMLInputElement;
            const messageInput = document.getElementById('emailMessage') as HTMLTextAreaElement;
            const recipientEmail = emailInput?.value || selectedCustomer?.email;
            const message = messageInput?.value || `Sayın ${selectedCustomer?.contactPerson || 'Yetkili'}, \n\nEkte reklam alanları için hazırladığımız bütçe teklifimizi bulabilirsiniz.\n\nSaygılarımızla, \nİzmir Açıkhava Reklam Ajansı`;

            if (!recipientEmail) {
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return;
            }

            // Eğer selectedProposal yoksa (yeni teklif ise), önce teklifi kaydet
            let proposalId = selectedProposal?.id;

            if (selectedCustomer) {
                const userId = localStorage.getItem('userId') || '95959c2d-c5e1-454c-834f-3746d0a401c5';

                const finalItems = proposalItems.filter(item => item.quantity > 0).map(item => {
                    const price = (item.discountedPrice && item.discountedPrice > 0) ? item.discountedPrice : item.unitPrice;
                    const durationVal = parseInt(item.weekLayout || durationWeeks.toString()) || durationWeeks;
                    const itemBasePrice = (price * durationVal);
                    
                    // Her ürün için ayrı OP/BASKI satırları yerine metadata'da saklamak yeterli (veya ürün birim fiyatına dahil etme)
                    // Ancak tablo tasarımına sadık kalarak, ürüne her şeyi dahil ediyoruz:
                    const totalOp = (item.operationCost * (item.opQty || 1));
                    const totalPr = (item.printingCost * (item.opQty || 1));
                    
                    return {
                        description: `${item.network ? `${item.code} - Network ${item.network}` : item.code} (${durationVal} Hafta)`,
                        quantity: item.quantity,
                        unit_price: itemBasePrice,
                        metadata: {
                            type: item.type,
                            code: item.code,
                            duration: durationVal,
                            unit_price_base: item.unitPrice,
                            discounted_price: item.discountedPrice,
                            printing_cost: item.printingCost,
                            operation_cost: item.operationCost,
                            op_multiplier: item.opQty || 1
                        }
                    };
                });

                // Toplam operasyon ve baskı kalemlerini ayrı ekleyelim (tercih: tek fatura satırı veya ürün içine gömülü)
                // Kullanıcı "her ürün için ayrı" istediği için, ya metadata'da ya da ayrı satırlarda göstermeliyiz.
                // PDF'de düzgün görünmesi için ayrı satır olarak ekleyelim (her ürün sonrası):
                proposalItems.filter(item => item.quantity > 0).forEach(item => {
                    const opMult = item.opQty || 1;
                    if (item.operationCost > 0) {
                        finalItems.push({
                            description: `${item.code} Operasyon Maliyeti (${opMult} Adet/Kez)`,
                            quantity: 1,
                            unit_price: item.operationCost * opMult,
                            metadata: { type: 'OP', source_code: item.code, multiplier: opMult }
                        } as any);
                    }
                    if (item.printingCost > 0) {
                        finalItems.push({
                            description: `${item.code} Baskı Bedeli (${opMult} Adet/Kez)`,
                            quantity: 1,
                            unit_price: item.printingCost * opMult,
                            metadata: { type: 'BASKI', source_code: item.code, multiplier: opMult }
                        } as any);
                    }
                });

                if (proposalId) {
                    // Mevcut teklifi güncelle
                    await proposalsService.update(proposalId, {
                        title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                        description: getWeekRangeVal(),
                        subtotal: subtotalVal(),
                        tax_rate: kdvRate,
                        tax_amount: kdvVal(),
                        total: grandTotalVal(),
                        items: finalItems
                    });
                } else {
                    // Yeni teklif oluştur
                    const newProposal = await proposalsService.create({
                        title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                        description: getWeekRangeVal(),
                        client_id: selectedCustomer.id,
                        created_by_id: userId,
                        subtotal: subtotalVal(),
                        tax_rate: kdvRate,
                        tax_amount: kdvVal(),
                        total: grandTotalVal(),
                        items: finalItems
                    });
                    proposalId = newProposal.id;
                }
            }

            if (!proposalId) {
                alert('Teklif oluşturulamadı.');
                return;
            }

            // E-postayı seçilen hesaptan gönder
            const senderEmail = selectedSenderEmail;

            const response = await proposalsService.sendEmail(proposalId, recipientEmail, message, senderEmail);

            if (response.success) {
                // Teklifi 'sent' durumuna güncelle
                await proposalsService.updateStatus(proposalId, 'SENT');

                success(`Teklif ${recipientEmail} adresine ${senderEmail} üzerinden gönderildi.`);
                setShowEmailModal(false);
                setShowProposalModal(false);
                setMainProposalItems([]); // Clear main draft on success
                fetchData(); // Listeyi yenile
                setActiveTab('sent'); // Gönderilen Teklifler sekmesine geç
            } else {
                alert('E-posta gönderilirken bir hata oluştu: ' + response.message);
            }
        } catch (error: any) {
            console.error('Email send error:', error);
            alert('E-posta gönderilemedi: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    }

    // Satış temsilcisi Onayla diyince sadece modal açılır
    const handleApproveProposal = async (id: string) => {
        const proposal = proposals.find(p => p.id === id);
        if (proposal) {
            setSelectedProposal(proposal);
            setShowApproveModal(true);
        }
    }

    // Modal içerisinden "Rezervasyona Gönder" butonuna basınca çalışır
    const handleSendToReservationFromApprove = async (proposalId: string, itemsData: any[]) => {
        try {
            setIsLoading(true);
            
            // 1. Teklifin durumunu APPROVED yap
            await proposalsService.updateStatus(proposalId, 'APPROVED');

            // 2. Rezervasyon sistemine aktarmak için yeni bir Customer Request (Yer Talebi) oluşturuyoruz.
            const proposal = proposals.find(p => p.id === proposalId);
            if (proposal) {
                // Her ürün için ayrı bir json özeti hazırlıyoruz veya tek seferde details'in içine gömüyoruz.
                // Rezervasyon Yetkilisi bu bilgileri görecek.
                const details = {
                    approvedItems: itemsData.map(item => ({
                        productType: item.type,
                        productCode: item.code,
                        quantity: item.quantity,
                        startDate: item.startDate,
                        durationWeeks: item.durationWeeks,
                    })),
                    source: 'sale_approved'
                };

                // Asıl request oluşturulur (Talebi Rezervasyon Yönetimine Düşür)
                await customerRequestsService.create({
                    request_number: proposal.proposalNumber || `REV-${Date.now()}`,
                    client_id: proposal.customerId,
                    product_type: itemsData[0]?.type || 'BB', // İlk ürünün tipini ana tip olarak alıyoruz
                    product_details: JSON.stringify(details),
                    quantity: itemsData.reduce((acc, curr) => acc + curr.quantity, 0),
                    start_date: itemsData[0]?.startDate || new Date().toISOString().split('T')[0],
                    end_date: new Date(new Date(itemsData[0]?.startDate || new Date()).getTime() + (itemsData[0]?.durationWeeks || 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    priority: 'high',
                    status: 'pending', // Bekleyen iş olarak düşecek
                    notes: JSON.stringify({
                        type: 'sale_approved_to_reservation',
                        proposal_id: proposalId,
                        message: 'Satış temsilcisi teklifi onayladı ve işlem yapılmasını bekliyor.',
                        createdAt: new Date().toISOString()
                    })
                });

                success(`Teklif #${proposal.proposalNumber} onaylandı ve rezervasyon birimine iletildi.`);
            }

            fetchData();
        } catch (error: any) {
            console.error('Approve error:', error);
            alert('Teklif onaylanırken hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    }

    const handleReviseFromSent = async (proposal: Proposal) => {
        try {
            setIsLoading(true);
            // Teklifi 'draft' durumuna çek
            await proposalsService.updateStatus(proposal.id, 'DRAFT');

            // Teklif hazırlama modalanı açmak için gerekli state'leri set et
            const customer = customers.find(c => c.id === proposal.customerId);
            if (customer) {
                setSelectedCustomer(customer);
            }
            setSelectedProposal(proposal);
            
            // Backend'den gelen verileri ProposalItem formatına dönüştür
            const productTypesList = getProductTypes();
            const rawItems = proposal.items || [];
            
            const mappedItems = rawItems
                .filter((item: any) => {
                    const desc = (item.description || '').toLowerCase();
                    return !desc.includes('operasyon maliyeti') && !desc.includes('baskı bedeli');
                })
                .map((item: any) => {
                    const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : (item.metadata || {});
                    
                    // Metadata'dan fiyatları almaya çalış
                    let unitPrice = Number(meta.unit_price_base);
                    let discountedPrice = Number(meta.discounted_price);
                    
                    // Metadata yoksa veya eksikse logic:
                    if (!unitPrice) {
                        // Backend'den gelen unit_price aslında satılan fiyattır (indirimli)
                        const bakedPrice = Number(item.unit_price) || 0;
                        
                        // Ürün tipini açıklamaya göre bulmaya çalış
                        const descUpper = (item.description || '').toUpperCase();
                        const prodType = productTypesList.find((p: any) => 
                            descUpper.includes(p.name) || meta.code === p.code || meta.type === p.code
                        );

                        if (prodType) {
                            unitPrice = prodType.unitPrice;
                            discountedPrice = bakedPrice; // Satılan fiyat indirimli alana
                        } else {
                            unitPrice = bakedPrice;
                            discountedPrice = 0;
                        }
                    }

                    // Operasyon çarpanını metadata'dan veya açıklamadan ayıkla
                    let itemOpQty = Number(meta.op_multiplier) || 1;
                    if (!meta.op_multiplier) {
                        // Eğer global çarpan varsa (eski sistem) ondan alabiliriz
                        const globalOpItem = rawItems.find((ri: any) => ri.description?.includes('Operasyon Adedi') || ri.description?.includes('Operasyon Maliyeti'));
                        if (globalOpItem) {
                            const qMatch = globalOpItem.description?.match(/(\d+)\s*Adet/i) || globalOpItem.description?.match(/(\d+)\s*Kez/i);
                            if (qMatch) itemOpQty = parseInt(qMatch[1]);
                        }
                    }

                    return {
                        type: meta.type || (
                            (item.description || '').toUpperCase().includes('BILLBOARD') ? 'BB' : 
                            (item.description || '').toUpperCase().includes('RAKET') ? 'CLP' :
                            (item.description || '').toUpperCase().includes('MEGALIGHT') ? 'MGL' :
                            (item.description || '').toUpperCase().includes('LED') ? 'LB' : 
                            (item.description || '').toUpperCase().includes('GIANT') ? 'GB' : 'BB'
                        ),
                        code: meta.code || item.description?.split(' (')[0] || item.description,
                        quantity: Number(item.quantity) || 0,
                        unitPrice: unitPrice,
                        discountedPrice: discountedPrice,
                        printingCost: Number(meta.printing_cost) || Number(item.printing_cost) || 0,
                        operationCost: Number(meta.operation_cost) || Number(item.operation_cost) || 0,
                        opQty: itemOpQty,
                        weekLayout: meta.duration?.toString() || item.description?.match(/\((\d+)\s*Hafta\)/i)?.[1] || '1',
                        network: meta.network
                    };
                });
            
            setProposalItems(mappedItems);

            // Süreyi ayıkla
            const duration = parseInt(proposal.usagePeriod || '1');
            setDurationWeeks(isNaN(duration) ? 1 : duration);

            // Dönemi ayıkla
            if (proposal.weekInfo) {
                const parts = proposal.weekInfo.split(' ');
                if (parts.length >= 2) {
                    const mIdx = monthNames.indexOf(parts[0]);
                    if (mIdx !== -1) setStartMonth(mIdx + 1);
                    const weekNum = parseInt(parts[1]);
                    if (!isNaN(weekNum)) setStartWeek(weekNum);
                }
            }

            setShowProposalModal(true);
            setActiveTab('proposals'); // Bütçe Teklifleri sekmesine yönlendir (taslak olduğu için)

            fetchData();
            success(`Teklif #${proposal.proposalNumber || proposal.id} revize edilmek üzere hazırlandı.`);
        } catch (error: any) {
            console.error('Revise error:', error);
            alert('Teklif revize edilirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteProposal = async (id: string) => {
        if (!window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) return;

        try {
            setIsLoading(true);
            await proposalsService.delete(id);
            success('Teklif başarıyla silindi.');
            fetchData(); // Refresh list
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('Teklif silinirken hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteCustomer = async (id: string) => {
        if (!window.confirm('Bu müşteriyi ve tüm ilişkili verilerini silmek istediğinize emin misiniz?')) return;

        try {
            setIsLoading(true);
            await clientsService.delete(id);
            success('Müşteri başarıyla silindi.');
            fetchData(); // Refresh list
        } catch (error: any) {
            console.error('Customer delete error:', error);
            alert('Müşteri silinirken hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddToMainProposal = (items: ProposalItem[], isBlock: boolean, rate: 20 | 14) => {
        // Mevcut ana teklife yeni kalemleri ekle
        setMainProposalItems(prev => [...prev, ...items]);
        setMainProposalIsBlock(isBlock);
        setMainProposalKdvRate(rate);
        success('Ürünler ana teklif taslağına eklendi.');
    }

    const handleRemoveFromMainProposal = (index: number) => {
        setMainProposalItems(prev => prev.filter((_, i) => i !== index));
    }

    const handleSendMainProposal = () => {
        if (!selectedCustomer) return;
        
        // Modal'daki state'leri ana tekliften gelenlerle senkronize et ki handleSendEmail doğru çalışsın
        setProposalItems(mainProposalItems);
        setIsBlockList(mainProposalIsBlock);
        setKdvRate(mainProposalKdvRate);
        
        setShowEmailModal(true);
    }

    const handleSaveProposal = async () => {
        if (!selectedCustomer) return

        try {
            const userId = localStorage.getItem('userId') || '95959c2d-c5e1-454c-834f-3746d0a401c5' // Fallback to Ali's ID if not found

            // Her zaman true olarak kabul ediyoruz (Multiplier mantığı)
            const isMultiplierMode = true;

            const finalItems = proposalItems.filter(item => item.quantity > 0).map(item => {
                const price = (item.discountedPrice && item.discountedPrice > 0) ? item.discountedPrice : item.unitPrice;
                const durationVal = parseInt(item.weekLayout || '1') || 1;
                const bakedUnitPrice = (price * durationVal);
                
                return {
                    description: `${item.network ? `${item.code} - Network ${item.network}` : item.code} (${durationVal} Hafta)`,
                    quantity: item.quantity,
                    unit_price: bakedUnitPrice,
                    metadata: {
                        type: item.type,
                        code: item.code,
                        duration: durationVal,
                        unit_price_base: item.unitPrice,
                        discounted_price: item.discountedPrice,
                        printing_cost: item.printingCost,
                        operation_cost: item.operationCost,
                        op_multiplier: item.opQty || 1
                    }
                };
            });

            // Per-item service rows
            proposalItems.filter(item => item.quantity > 0).forEach(item => {
                const opMult = item.opQty || 1;
                if (item.operationCost > 0) {
                    finalItems.push({
                        description: `${item.code} Operasyon Maliyeti (${opMult} Adet/Kez)`,
                        quantity: 1,
                        unit_price: item.operationCost * opMult,
                        metadata: { type: 'OP', source_code: item.code, multiplier: opMult }
                    } as any);
                }
                if (item.printingCost > 0) {
                    finalItems.push({
                        description: `${item.code} Baskı Bedeli (${opMult} Adet/Kez)`,
                        quantity: 1,
                        unit_price: item.printingCost * opMult,
                        metadata: { type: 'BASKI', source_code: item.code, multiplier: opMult }
                    } as any);
                }
            });

            const subtotal = subtotalVal();
            const tax = kdvVal();
            const total = grandTotalVal();

            if (selectedProposal) {
                // Mevcut teklifi güncelle
                await proposalsService.update(selectedProposal.id, {
                    title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                    description: getWeekRangeVal(),
                    subtotal,
                    tax_rate: kdvRate,
                    tax_amount: tax,
                    total,
                    items: finalItems
                })
                success('Teklif başarıyla güncellendi.')
            } else {
                // Yeni teklif oluştur
                await proposalsService.create({
                    title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                    description: getWeekRangeVal(),
                    client_id: selectedCustomer.id,
                    created_by_id: userId,
                    subtotal,
                    tax_rate: kdvRate,
                    tax_amount: tax,
                    total,
                    items: finalItems
                })
                success('Teklif taslağı başarıyla kaydedildi.')
            }
            setShowProposalModal(false)
            fetchData() // Refresh data
            setActiveTab('sent') // Gönderilen Teklifler sekmesine geç
        } catch (error) {
            console.error('Proposal save error:', error)
            alert('Teklif kaydedilirken hata oluştu.')
        }
    }

    const handleSendToReservation = () => {
        // Rezervasyona talep gönderme simülasyonu
        const reservationEmail = 'pazarlama@izmiracikhavareklam.com'
        const itemsSummary = proposalItems.map(item => {
            const label = item.network ? `${item.code} (Network ${item.network})` : item.code
            return `${item.quantity} ${label} `
        }).join(', ')
        const dateRange = getWeekRangeVal()
        const totalWeeks = calculateTotalWeeks(startMonth, startWeek, durationWeeks)
        alert(`Yer Listesi Talebi Gönderildi!\n\nAlıcı: ${reservationEmail} \nMüşteri: ${selectedCustomer?.companyName} \nÜrünler: ${itemsSummary} \nToplam Hafta: ${totalWeeks} \nKullanım Süresi: ${dateRange} \n\nTeklif onaylanmıştır.`)
        setShowReservationModal(false)
        setShowProposalModal(false)
    }

    const handleApproveResults = async (requestId: string) => {
        try {
            await customerRequestsService.update(requestId, { status: 'approved' })
            success('Operasyon sonuçları onaylandı. Rezervasyon aşamasına geçilebilir.')
            fetchData()
        } catch (error) {
            console.error('Approval error:', error)
            alert('Onaylanırken hata oluştu.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Satış Departmanı</h1>
                    <p className="text-gray-500">Müşteri kartları, bütçe teklifleri ve mail gönderimi</p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-primary-600 font-medium bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Veriler yükleniyor...</span>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customers'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Müşteri Kartları
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('proposals')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'proposals'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Bütçe Teklifleri
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sent'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Gönderilen Teklifler
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('reservations')}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${activeTab === 'reservations'
                        ? 'border-primary-600 text-primary-600 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Rezervasyondan Gelenler
                        {customerRequests.filter(r => r.status === 'checked_by_ops').length > 0 && (
                            <span className="flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] items-center justify-center text-white">
                                    {customerRequests.filter(r => r.status === 'checked_by_ops').length}
                                </span>
                            </span>
                        )}
                    </div>
                </button>
            </div>

            <SalesStats 
                customers={customers}
                proposals={proposals}
                setActiveTab={setActiveTab}
            />

            {/* Tab Content */}
            {activeTab === 'customers' && (
                <CustomerList
                    customers={customers}
                    customerViewType={customerViewType}
                    setCustomerViewType={setCustomerViewType}
                    setShowCustomerModal={setShowCustomerModal}
                    setSelectedCustomer={setSelectedCustomer}
                    setSelectedProposal={setSelectedProposal}
                    setProposalItems={setProposalItems}
                    setShowProposalModal={setShowProposalModal}
                    setCustomerForm={setCustomerForm}
                    handleDeleteCustomer={handleDeleteCustomer}
                    getProductTypes={getProductTypes}
                    isAdmin={isAdmin}
                />
            )}

            {activeTab === 'proposals' && (
                <ProposalList
                    proposals={proposals}
                    customers={customers}
                    handleApproveProposal={handleApproveProposal}
                    setSelectedCustomer={setSelectedCustomer}
                    setSelectedProposal={setSelectedProposal}
                    setProposalItems={setProposalItems}
                    setIsBlockList={setIsBlockList}
                    setShowProposalModal={setShowProposalModal}
                    setIsLocationModalOpen={setIsLocationModalOpen}
                    setIsContractModalOpen={setIsContractModalOpen}
                />
            )}

            {activeTab === 'sent' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Gönderilen Teklifler</h3>
                                <p className="text-sm text-gray-500">Müşteriye mail ile gönderilen tüm teklifler</p>
                            </div>
                            <button 
                                onClick={fetchData} 
                                disabled={isLoading}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                Yenile
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {proposals.filter(p => p.status === 'sent' || p.status === 'approved').length > 0 ? (
                                proposals
                                    .filter(p => p.status === 'sent' || p.status === 'approved')
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((proposal) => (
                                    <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 ${proposal.status === 'approved' ? 'bg-blue-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                                                    {proposal.status === 'approved' ? (
                                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Send className="w-5 h-5 text-green-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-gray-900">{proposal.proposalNumber ? `${proposal.proposalNumber} - ` : ''}{proposal.customerName}</h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                            proposal.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {proposal.status === 'approved' ? 'ONAYLANDI' : 'GÖNDERİLDİ'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Gönderim: {proposal.sentAt || proposal.createdAt}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">₺{proposal.totalAmount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400">KDV Dahil</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {proposal.status === 'sent' && (
                                                        <button
                                                            onClick={() => handleApproveProposal(proposal.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Onayla
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProposal(proposal)
                                                            setIsContractModalOpen(true)
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Teklif
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviseFromSent(proposal)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Revize Et
                                                    </button>
                                                    {proposal.status === 'sent' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProposal(proposal)
                                                                setIsLocationModalOpen(true)
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                            Yer Talebi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 ml-14">
                                            {proposal.items.map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                                                    {item.quantity} {item.code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <Send className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Henüz gönderilmiş teklif bulunmuyor.</p>
                                    <p className="text-sm mt-2">Bütçe Teklifleri sekmesinden teklif göndererek başlayın.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reservations' && (

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Operasyondan Gelen Onay Bekleyenler</h3>
                        <button 
                            onClick={fetchData} 
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Listeyi Yenile
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {customerRequests.filter(r => r.status === 'checked_by_ops').length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Onay Bekleyen Liste Yok</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">Operasyondan gelen herhangi bir müsaitlik kontrol sonucu bulunmuyor.</p>
                            </div>
                        ) : (
                            customerRequests.filter(r => r.status === 'checked_by_ops').map(request => {
                                let results: any = null;
                                try {
                                    const notes = JSON.parse(request.notes || '{}');
                                    results = notes.results;
                                } catch (e) { }

                                return (
                                    <div key={request.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                                                    <Hash className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{request.customerName}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                                            {request.requestNumber}
                                                        </span>
                                                        <span className="text-xs text-gray-400">• {request.createdAt}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleApproveResults(request.id)}
                                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Sonuçları Onayla
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-gray-50/50">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Search className="w-3 h-3" />
                                                    Müsaitlik Özeti
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:border-emerald-200 transition-colors">
                                                        <div className="text-2xl font-black text-emerald-600">{results?.available?.length || 0}</div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Tam Müsait</div>
                                                        <div className="h-1 w-8 bg-emerald-500 rounded-full mt-2 group-hover:w-full transition-all duration-500"></div>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:border-amber-200 transition-colors">
                                                        <div className="text-2xl font-black text-amber-600">{results?.options?.length || 0}</div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Kısmi / Opsiyon</div>
                                                        <div className="h-1 w-8 bg-amber-500 rounded-full mt-2 group-hover:w-full transition-all duration-500"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {(results?.available?.length > 0 || results?.options?.length > 0) && (
                                                <div className="mt-8">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <LayoutGrid className="w-3 h-3" />
                                                        Bulunan Üniteler Detaylı Liste
                                                    </h4>
                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">#</th>
                                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Ünite Kodu</th>
                                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider">Durum</th>
                                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Açıklama</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {results.available.map((loc: any, idx: number) => (
                                                                    <tr key={`avail-${idx}`} className="hover:bg-emerald-50/30 transition-colors group">
                                                                        <td className="px-6 py-3 text-xs text-gray-400 font-medium w-16">{idx + 1}</td>
                                                                        <td className="px-6 py-3">
                                                                            <span className="font-mono font-bold text-gray-900 group-hover:text-emerald-700">{loc.kod}</span>
                                                                        </td>
                                                                        <td className="px-6 py-3">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">Tam Müsait</span>
                                                                        </td>
                                                                        <td className="px-6 py-3 text-right">
                                                                            <span className="text-[10px] text-gray-500 italic">Hemen Rezervasyon</span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {results.options.map((loc: any, idx: number) => (
                                                                    <tr key={`opt-${idx}`} className="hover:bg-amber-50/30 transition-colors group">
                                                                        <td className="px-6 py-3 text-xs text-gray-400 font-medium w-16">{results.available.length + idx + 1}</td>
                                                                        <td className="px-6 py-3">
                                                                            <span className="font-mono font-bold text-gray-900 group-hover:text-amber-700">{loc.kod}</span>
                                                                        </td>
                                                                        <td className="px-6 py-3">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-700 uppercase">Opsiyon / Alt Sıra</span>
                                                                        </td>
                                                                        <td className="px-6 py-3 text-right">
                                                                            <span className="text-[10px] text-gray-500 italic">Sıraya Alınacak</span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
            <CustomerModal
                showCustomerModal={showCustomerModal}
                selectedCustomer={selectedCustomer}
                setShowCustomerModal={setShowCustomerModal}
                setSelectedCustomer={setSelectedCustomer}
                customerModalTab={customerModalTab}
                setCustomerModalTab={setCustomerModalTab}
                customerForm={customerForm}
                setCustomerForm={setCustomerForm}
                showCompanySuggestions={showCompanySuggestions}
                setShowCompanySuggestions={setShowCompanySuggestions}
                incomingCalls={incomingCalls}
                setPendingIncomingCallId={setPendingIncomingCallId}
                noteInput={noteInput}
                setNoteInput={setNoteInput}
                noteFilterDate={noteFilterDate}
                setNoteFilterDate={setNoteFilterDate}
                handleSaveCustomer={handleSaveCustomer}
            />



                <ProposalModal
                    showProposalModal={showProposalModal}
                    setShowProposalModal={setShowProposalModal}
                    selectedCustomer={selectedCustomer}
                    selectedProposal={selectedProposal}
                    proposalItems={proposalItems}
                    addProposalItem={addProposalItem}
                    removeProposalItem={removeProposalItem}
                    updateProposalItem={updateProposalItem}
                    isBlockList={isBlockList}
                    setIsBlockList={setIsBlockList}
                    kdvRate={kdvRate}
                    setKdvRate={setKdvRate}
                    durationWeeks={durationWeeks}
                    onAddToMainProposal={handleAddToMainProposal}
                    showShowMainProposal={mainProposalItems.length > 0}
                    onShowMainProposal={() => setShowProposalModal(false)}
                />

            {/* Yeni Müşteri Talebi Modalı */}
            {
            <CustomerRequestModal
                showRequestModal={showRequestModal}
                setShowRequestModal={setShowRequestModal}
                requestForm={requestForm}
                setRequestForm={setRequestForm}
                customers={customers}
                handleCreateRequest={handleCreateRequest}
            />
            }
            {/* Modal for Location Request */}
            <LocationRequestModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                proposal={selectedProposal ? {
                    id: selectedProposal.id,
                    proposal_number: selectedProposal.proposalNumber || selectedProposal.id,
                    title: `Teklif - ${selectedProposal.customerName} `,
                    client_id: selectedProposal.customerId,
                    created_by_id: 'admin',
                    client: { name: selectedProposal.customerName } as any,
                    items: selectedProposal.items.map((item, i) => ({
                        id: String(i),
                        proposal_id: selectedProposal.id,
                        description: item.code,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        total: item.quantity * item.unitPrice,
                        order: i
                    })),
                    status: selectedProposal.status.toUpperCase(),
                    subtotal: selectedProposal.totalAmount,
                    tax_rate: 20,
                    tax_amount: selectedProposal.kdvAmount,
                    total: selectedProposal.grandTotal,
                    created_at: selectedProposal.createdAt,
                    updated_at: selectedProposal.createdAt
                } as any : null}
                onComplete={() => {
                    if (selectedProposal) {
                        setProposals(prev => prev.map(p =>
                            p.id === selectedProposal.id ? { ...p, status: 'approved' } : p
                        ))
                    }
                }}
            />


            {/* Approve Proposal Modal */}
            <ApproveProposalModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                proposal={selectedProposal}
                onApprove={handleSendToReservationFromApprove}
            />

            {/* Modal for Proposal Contract/View */}
            <ProposalContractModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                proposal={selectedProposal ? {
                    id: selectedProposal.id,
                    proposal_number: selectedProposal.proposalNumber || selectedProposal.id,
                    title: `Teklif - ${selectedProposal.customerName}`,
                    client_id: selectedProposal.customerId,
                    created_by_id: 'admin',
                    client: { name: selectedProposal.customerName } as any,
                    items: selectedProposal.items.map((item, i) => ({
                        id: String(i),
                        proposal_id: selectedProposal.id,
                        description: item.code,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        discounted_price: item.discountedPrice || item.unitPrice,
                        printing_cost: item.printingCost,
                        operation_cost: item.operationCost,
                        total: item.quantity * item.unitPrice,
                        order: i
                    })),
                    status: selectedProposal.status.toUpperCase(),
                    subtotal: selectedProposal.totalAmount,
                    tax_rate: 20,
                    tax_amount: selectedProposal.kdvAmount,
                    total: selectedProposal.grandTotal,
                    created_at: selectedProposal.createdAt,
                    updated_at: selectedProposal.createdAt
                } as any : null}
            />

            {/* Email Modal */}
            {showEmailModal && (
            <EmailModal
                showEmailModal={showEmailModal}
                setShowEmailModal={setShowEmailModal}
                selectedProposal={selectedProposal}
                selectedCustomer={selectedCustomer}
                selectedSenderEmail={selectedSenderEmail}
                setSelectedSenderEmail={setSelectedSenderEmail}
                emailAccounts={emailAccounts}
                durationWeeks={durationWeeks}
                handleSendEmail={handleSendEmail}
                grandTotal={grandTotalVal()}
            />
            )}
            
            <MainProposalCard 
                items={mainProposalItems}
                onRemoveItem={handleRemoveFromMainProposal}
                onSend={handleSendMainProposal}
                customerName={selectedCustomer?.companyName || ''}
                totalAmount={calculateGrandTotal(mainProposalItems, mainProposalKdvRate)}
            />
        </div >
    )
}
