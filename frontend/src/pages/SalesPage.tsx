import { useState, useEffect } from 'react'
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
    Trash2
} from 'lucide-react'
import LocationRequestModal from '../components/proposals/LocationRequestModal'
import { useToast } from '../hooks/useToast'
import { clientsService } from '../services/clientsService'
import { proposalsService } from '../services/proposalsService'
import { customerRequestsService } from '../services/customerRequestsService'
import { inventoryService, type InventoryItem } from '../services/inventoryService'

// Müşteri tipi
interface Customer {
    id: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
    address: string
    createdAt: string
    tradeName?: string
    sector?: string
    taxOffice?: string
    taxNumber?: string
    status?: string
    city?: string
    district?: string
    postalCode?: string
    mobile?: string
    website?: string
    notes?: string
}

// Teklif ürün tipi
interface ProposalItem {
    type: string
    code: string
    quantity: number
    unitPrice: number
    operationCost: number
    network?: string
}

// Teklif tipi
interface Proposal {
    id: string
    proposalNumber?: string
    customerId: string
    customerName: string
    items: ProposalItem[]
    totalAmount: number
    operationTotal: number
    kdvAmount: number
    grandTotal: number
    isBlockList: boolean
    status: 'draft' | 'sent' | 'approved' | 'rejected'
    createdAt: string
    sentAt?: string
    weekInfo?: string
    usagePeriod?: string
}

// Müşteri Talebi tipi
interface CustomerRequest {
    id: string
    requestNumber: string
    customerId: string
    customerName: string
    productType: string
    productDetails: string
    quantity: number
    notes: string
    budgetSource: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
}

// Örnek ürün tipleri - Maliyet Ayarlarından alınır
const getProductTypes = () => {
    const saved = localStorage.getItem('productPrices')
    if (saved) {
        return JSON.parse(saved)
    }
    return [
        { code: 'BB', name: 'Billboard', duration: '1 Hafta', unitPrice: 3500, operationCost: 400 },
        { code: 'CLP', name: 'CLP Raket', duration: '1 Hafta', unitPrice: 1200, operationCost: 150 },
        { code: 'MGL', name: 'Megalight', duration: '1 Hafta', unitPrice: 5000, operationCost: 500 },
        { code: 'LB', name: 'LED', duration: '1 Hafta', unitPrice: 8000, operationCost: 0 },
        { code: 'GB', name: 'Giantboard', duration: '10 Gün', unitPrice: 7500, operationCost: 600 },
        { code: 'MB', name: 'Megaboard', duration: '1 Ay', unitPrice: 15000, operationCost: 1000 },
        { code: 'KB', name: 'Kuleboard', duration: '1 Ay', unitPrice: 12000, operationCost: 800 },
    ]
}

export default function SalesPage() {
    const [activeTab, setActiveTab] = useState<'customers' | 'proposals' | 'sent'>('customers')
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [showProposalModal, setShowProposalModal] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [showReservationModal, setShowReservationModal] = useState(false)
    const [showLocationListModal, setShowLocationListModal] = useState(false)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const { success, info } = useToast()
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [networkCounts, setNetworkCounts] = useState<Record<string, Record<string, number>>>({})

    // Fetch data on mount
    useEffect(() => {
        fetchData()
    }, [])

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
                status: (c as any).status || 'Potansiyel',
                city: (c as any).city || '',
                district: (c as any).district || '',
                postalCode: (c as any).postal_code || '',
                mobile: (c as any).mobile || '',
                website: (c as any).website || '',
                notes: (c as any).notes || '',
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

                    let itemType = 'BB';
                    if (desc.includes('Billboard') || desc.includes('BB')) itemType = 'BB';
                    else if (desc.includes('CLP') || desc.includes('City Light')) itemType = 'CLP';
                    else if (desc.includes('Megalight') || desc.includes('MGL')) itemType = 'MGL';
                    else if (desc.includes('Giantboard') || desc.includes('GB')) itemType = 'GB';

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
            const mappedRequests: CustomerRequest[] = requestsData.map(r => ({
                id: (r as any).id,
                requestNumber: (r as any).request_number,
                customerId: (r as any).client_id,
                customerName: (r as any).client?.company_name || 'Bilinmeyen Müşteri',
                productType: (r as any).product_type,
                productDetails: (r as any).product_details || '',
                quantity: (r as any).quantity,
                notes: (r as any).notes || '',
                budgetSource: '',
                status: ((r as any).status === 'pending' ? 'pending' : (r as any).status === 'approved' ? 'approved' : 'rejected') as any,
                createdAt: (r as any).created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
            }))
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

        } catch (error) {
            console.error('Data fetch error:', error)
            info('Veriler sunucudan alınırken bir hata oluştu.')
        } finally {
            setIsLoading(false)
        }
    }

    // Form states
    const [customerModalTab, setCustomerModalTab] = useState<'company' | 'address' | 'contact' | 'notes'>('company')
    const [customerForm, setCustomerForm] = useState({
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
        notes: ''
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

    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([
        { type: 'BB', code: 'Billboard', quantity: 0, unitPrice: 3500, operationCost: 400, network: '' }
    ])
    const [isBlockList, setIsBlockList] = useState(false)
    const [kdvRate, setKdvRate] = useState<20 | 14>(20)
    // Hafta bazlı tarih seçimi
    const [startMonth, setStartMonth] = useState(1)
    const [startWeek, setStartWeek] = useState(1)
    const [durationWeeks, setDurationWeeks] = useState(1)

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
                { type: 'BB', code: 'Billboard', quantity: 20, unitPrice: 3500, operationCost: 400 },
                { type: 'GB', code: 'Giantboard', quantity: 4, unitPrice: 7500, operationCost: 600 },
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
                { type: 'CLP', code: 'CLP Raket', quantity: 15, unitPrice: 1200, operationCost: 150 },
                { type: 'ML', code: 'Megalight', quantity: 3, unitPrice: 5000, operationCost: 500 }
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
                { type: 'BB', code: 'Billboard', quantity: 20, unitPrice: 3500, operationCost: 400 },
                { type: 'GB', code: 'Giantboard', quantity: 4, unitPrice: 7500, operationCost: 600 },
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
                { type: 'ML', code: 'Megalight', quantity: 10, unitPrice: 5000, operationCost: 500 },
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
            quantity: 0,
            unitPrice: defaultProduct.unitPrice,
            operationCost: defaultProduct.operationCost
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
                    operationCost: product.operationCost,
                    network: undefined,
                    quantity: (product.code === 'BB' || product.code === 'GB') ? 0 : updated[index].quantity
                }
            }
        } else if (field === 'network') {
            const count = (networkCounts[updated[index].type] || {})[value as string] || 0
            updated[index] = {
                ...updated[index],
                network: value as string,
                quantity: count
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
            const userId = localStorage.getItem('userId') || ''

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
                account_manager_id: userId
            }

            if (selectedCustomer) {
                await (clientsService as any).update(selectedCustomer.id, customerData)
                success('Müşteri başarıyla güncellendi.')
            } else {
                await (clientsService as any).create(customerData)
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
                notes: ''
            })
            setCustomerModalTab('company')
        } catch (error) {
            console.error('Customer save error:', error)
            alert('Müşteri kaydedilirken hata oluştu.')
        }
    }

    // Hesaplama fonksiyonları
    const calculateProductTotal = () => {
        return proposalItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * durationWeeks), 0)
    }

    const calculateOperationTotal = () => {
        if (isBlockList) {
            // Blok listede operasyon maliyeti tek sefer alınır
            return proposalItems.reduce((sum, item) => sum + item.operationCost, 0)
        }
        // Normal listede adet başına operasyon maliyeti
        return proposalItems.reduce((sum, item) => sum + (item.quantity * item.operationCost), 0)
    }

    const calculateSubtotal = () => {
        return calculateProductTotal() + calculateOperationTotal()
    }

    const calculateKDV = () => {
        return calculateSubtotal() * (kdvRate / 100)
    }

    const calculateGrandTotal = () => {
        return calculateSubtotal() + calculateKDV()
    }

    // Ay adları
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]

    // Ayın kaç haftası olduğunu hesapla
    const getWeeksInMonth = (month: number, year: number = 2026): number => {
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)
        const daysInMonth = lastDay.getDate()
        const firstDayOfWeek = firstDay.getDay()
        return Math.ceil((daysInMonth + firstDayOfWeek) / 7)
    }

    // Ayın belirli haftasının Pazartesi tarihini bul
    const getWeekStartDate = (month: number, week: number, year: number = 2026): Date => {
        const firstDay = new Date(year, month - 1, 1)
        const firstMonday = new Date(firstDay)
        const dayOfWeek = firstDay.getDay()
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek)
        firstMonday.setDate(1 + daysUntilMonday + (week - 1) * 7)
        return firstMonday
    }

    // Hafta aralığı formatı
    const getWeekRangeText = (): string => {
        const startText = `${monthNames[startMonth - 1]} ${startWeek}. Hafta`
        return `${startText} - ${durationWeeks} Hafta`
    }

    // Toplam hafta sayısını hesapla
    const calculateTotalWeeks = (): number => {
        return durationWeeks
    }

    // Tarih formatlama
    const formatWeekDate = (month: number, week: number): string => {
        const date = getWeekStartDate(month, week)
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
    }

    const handleSendEmail = async () => {
        try {
            setIsLoading(true);
            const emailInput = document.getElementById('recipientEmail') as HTMLInputElement;
            const messageInput = document.getElementById('emailMessage') as HTMLTextAreaElement;
            const recipientEmail = emailInput?.value || selectedCustomer?.email;
            const message = messageInput?.value || `Sayın ${selectedCustomer?.contactPerson || 'Yetkili'},\n\nEkte reklam alanları için hazırladığımız bütçe teklifimizi bulabilirsiniz.\n\nSaygılarımızla,\nİzmir Açıkhava Reklam Ajansı`;

            if (!recipientEmail) {
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return;
            }

            // Eğer selectedProposal yoksa (yeni teklif ise), önce teklifi kaydet
            let proposalId = selectedProposal?.id;

            if (selectedCustomer) {
                const userId = localStorage.getItem('userId') || '95959c2d-c5e1-454c-834f-3746d0a401c5';

                const finalItems = proposalItems.map(item => ({
                    description: `${item.network ? `${item.code} - Network ${item.network}` : item.code} (${durationWeeks} Hafta)`,
                    quantity: item.quantity,
                    unit_price: item.unitPrice * durationWeeks + (!isBlockList ? item.operationCost : 0),
                }));

                if (isBlockList) {
                    const totalOpCost = proposalItems.reduce((sum, item) => sum + item.operationCost, 0);
                    if (totalOpCost > 0) {
                        finalItems.push({
                            description: 'Operasyon Maliyeti (Blok Liste)',
                            quantity: 1,
                            unit_price: totalOpCost
                        });
                    }
                }

                if (proposalId) {
                    // Mevcut teklifi güncelle
                    await proposalsService.update(proposalId, {
                        title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                        description: getWeekRangeText(),
                        subtotal: calculateSubtotal(),
                        tax_rate: kdvRate,
                        tax_amount: calculateKDV(),
                        total: calculateGrandTotal(),
                        items: finalItems
                    });
                } else {
                    // Yeni teklif oluştur
                    const newProposal = await proposalsService.create({
                        title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                        description: getWeekRangeText(),
                        client_id: selectedCustomer.id,
                        created_by_id: userId,
                        subtotal: calculateSubtotal(),
                        tax_rate: kdvRate,
                        tax_amount: calculateKDV(),
                        total: calculateGrandTotal(),
                        items: finalItems
                    });
                    proposalId = newProposal.id;
                }
            }

            if (!proposalId) {
                alert('Teklif oluşturulamadı.');
                return;
            }

            // E-postayı rezervasyon@izmiracikhavareklam.com adresinden gönder
            const senderEmail = 'rezervasyon@izmiracikhavareklam.com';

            const response = await proposalsService.sendEmail(proposalId, recipientEmail, message);

            if (response.success) {
                // Teklifi 'sent' durumuna güncelle
                await proposalsService.updateStatus(proposalId, 'sent');

                success(`Teklif ${recipientEmail} adresine ${senderEmail} üzerinden gönderildi.`);
                setShowEmailModal(false);
                setShowProposalModal(false);
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

    const handleSaveProposal = async () => {
        if (!selectedCustomer) return

        try {
            const userId = localStorage.getItem('userId') || '95959c2d-c5e1-454c-834f-3746d0a401c5' // Fallback to Ali's ID if not found

            const finalItems = proposalItems.map(item => ({
                description: `${item.network ? `${item.code} - Network ${item.network}` : item.code} (${durationWeeks} Hafta)`,
                quantity: item.quantity,
                unit_price: item.unitPrice * durationWeeks + (!isBlockList ? item.operationCost : 0),
            }));

            if (isBlockList) {
                const totalOpCost = proposalItems.reduce((sum, item) => sum + item.operationCost, 0);
                if (totalOpCost > 0) {
                    finalItems.push({
                        description: 'Operasyon Maliyeti (Blok Liste)',
                        quantity: 1,
                        unit_price: totalOpCost
                    });
                }
            }

            if (selectedProposal) {
                // Mevcut teklifi güncelle
                await proposalsService.update(selectedProposal.id, {
                    title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                    description: getWeekRangeText(),
                    subtotal: calculateSubtotal(),
                    tax_rate: kdvRate,
                    tax_amount: calculateKDV(),
                    total: calculateGrandTotal(),
                    items: finalItems
                })
                success('Teklif başarıyla güncellendi.')
            } else {
                // Yeni teklif oluştur
                await proposalsService.create({
                    title: `${selectedCustomer.companyName} - Bütçe Teklifi`,
                    description: getWeekRangeText(),
                    client_id: selectedCustomer.id,
                    created_by_id: userId,
                    subtotal: calculateSubtotal(),
                    tax_rate: kdvRate,
                    tax_amount: calculateKDV(),
                    total: calculateGrandTotal(),
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
        const reservationEmail = 'rezervasyon@izmiracikhavareklam.com'
        const itemsSummary = proposalItems.map(item => {
            const label = item.network ? `${item.code} (Network ${item.network})` : item.code
            return `${item.quantity} ${label}`
        }).join(', ')
        const dateRange = getWeekRangeText()
        const totalWeeks = calculateTotalWeeks()
        alert(`Yer Listesi Talebi Gönderildi!\n\nAlıcı: ${reservationEmail}\nMüşteri: ${selectedCustomer?.companyName}\nÜrünler: ${itemsSummary}\nToplam Hafta: ${totalWeeks}\nKullanım Süresi: ${dateRange}\n\nTeklif onaylanmıştır.`)
        setShowReservationModal(false)
        setShowProposalModal(false)
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

            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Toplam Müşteri</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
                            <p className="text-sm text-green-600 mt-1">+2 bu hafta</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('proposals')}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:bg-yellow-50/30 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Hazırlanan Teklif</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{proposals.filter(p => p.status === 'draft').length}</p>
                            <p className="text-sm text-yellow-600 mt-1">{proposals.filter(p => p.status === 'draft').length} taslak</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('sent')}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:bg-green-50/30 group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Gönderilen</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{proposals.filter(p => p.status === 'sent' || p.status === 'approved').length}</p>
                            <p className="text-sm text-green-600 mt-1">Müşteriye iletildi</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Send className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Toplam Değer</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">₺{proposals.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}</p>
                            <p className="text-sm text-purple-600 mt-1">Tüm teklifler</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'customers' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Müşteri ara..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowCustomerModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25"
                        >
                            <UserPlus className="w-5 h-5" />
                            Yeni Müşteri Kartı
                        </button>
                    </div>

                    {/* Customers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customers.map((customer) => (
                            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-500">{customer.createdAt}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{customer.companyName}</h3>
                                <p className="text-sm text-gray-600 mb-3">{customer.contactPerson}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Mail className="w-4 h-4" />
                                        <span>{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Phone className="w-4 h-4" />
                                        <span>{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>{customer.address}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(customer)
                                            setSelectedProposal(null)
                                            setProposalItems([{ type: 'BB', code: 'Billboard', quantity: 0, unitPrice: 3500, operationCost: 400, network: '' }])
                                            setShowProposalModal(true)
                                        }}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                    >
                                        Teklif Hazırla
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(customer)
                                            setCustomerForm({
                                                companyName: customer.companyName,
                                                tradeName: (customer as any).tradeName || '',
                                                sector: (customer as any).sector || '',
                                                taxOffice: (customer as any).taxOffice || '',
                                                taxNumber: (customer as any).taxNumber || '',
                                                status: (customer as any).status || 'Potansiyel',
                                                address: customer.address || '',
                                                city: (customer as any).city || '',
                                                district: (customer as any).district || '',
                                                postalCode: (customer as any).postalCode || '',
                                                contactPerson: customer.contactPerson,
                                                email: customer.email,
                                                phone: customer.phone,
                                                mobile: (customer as any).mobile || '',
                                                website: (customer as any).website || '',
                                                notes: (customer as any).notes || ''
                                            })
                                            setShowCustomerModal(true)
                                        }}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Güncelle"
                                    >
                                        Revize
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCustomer(customer.id)}
                                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'proposals' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Bütçe Teklifleri</h3>
                                <p className="text-sm text-gray-500">Hazırlanan ve revize bekleyen tüm teklifler</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {proposals.length > 0 ? (
                                proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((proposal) => (
                                    <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${proposal.status === 'draft' ? 'bg-yellow-100' :
                                                    proposal.status === 'sent' ? 'bg-green-100' :
                                                        proposal.status === 'approved' ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                                                    <FileText className={`w-5 h-5 ${proposal.status === 'draft' ? 'text-yellow-600' :
                                                        proposal.status === 'sent' ? 'text-green-600' :
                                                            proposal.status === 'approved' ? 'text-blue-600' : 'text-gray-600'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-gray-900">{proposal.proposalNumber ? `${proposal.proposalNumber} - ` : ''}{proposal.customerName}</h4>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                            proposal.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                                proposal.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {proposal.status === 'draft' ? 'TASLAK' :
                                                                proposal.status === 'sent' ? 'GÖNDERİLDİ' :
                                                                    proposal.status === 'approved' ? 'ONAYLANDI' : proposal.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">Oluşturma: {proposal.createdAt}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">₺{proposal.totalAmount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400">KDV Dahil</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const customer = customers.find(c => c.id === proposal.customerId)
                                                            if (customer) {
                                                                setSelectedCustomer(customer)
                                                            }
                                                            setSelectedProposal(proposal)
                                                            setProposalItems([...proposal.items])
                                                            setIsBlockList(proposal.isBlockList)

                                                            // Süreyi ayıkla (Örn: "2 Hafta" -> 2)
                                                            const duration = parseInt(proposal.usagePeriod || '1')
                                                            setDurationWeeks(isNaN(duration) ? 1 : duration)

                                                            // Dönemi ayıkla
                                                            if (proposal.weekInfo) {
                                                                const parts = proposal.weekInfo.split(' ')
                                                                if (parts.length >= 2) {
                                                                    const mIdx = monthNames.indexOf(parts[0])
                                                                    if (mIdx !== -1) setStartMonth(mIdx + 1)
                                                                    const weekNum = parseInt(parts[1])
                                                                    if (!isNaN(weekNum)) setStartWeek(weekNum)
                                                                }
                                                            }

                                                            setShowProposalModal(true)
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Revize Et
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
                                                                handleDeleteProposal(proposal.id)
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Sil
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 ml-13">
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
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Henüz herhangi bir teklif oluşturulmamış.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sent' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Gönderilen Teklifler</h3>
                            <p className="text-sm text-gray-500">Müşteriye mail ile iletilen teklifler</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {proposals.filter(p => p.status === 'sent' || p.status === 'approved').map((proposal) => (
                                <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${proposal.status === 'approved' ? 'bg-blue-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                                                {proposal.status === 'approved' ? <CheckCircle className="w-5 h-5 text-blue-600" /> : <Check className="w-5 h-5 text-green-600" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-gray-900">{proposal.proposalNumber || proposal.id} - {proposal.customerName}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${proposal.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                        {proposal.status === 'approved' ? 'ONAYLANDI' : 'GÖNDERİLDİ'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">Gönderim: {proposal.sentAt}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-semibold text-gray-900">₺{proposal.totalAmount.toLocaleString()}</span>
                                            <div className="flex gap-2">
                                                {proposal.status === 'sent' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setProposals(prev => prev.map(p =>
                                                                    p.id === proposal.id ? { ...p, status: 'approved' } : p
                                                                ))
                                                                success('Teklif onaylandı olarak işaretlendi.')
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Onayla
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                // Müşteriyi bul ve seç
                                                                const customer = customers.find(c => c.id === proposal.customerId)
                                                                if (customer) {
                                                                    setSelectedCustomer(customer)
                                                                }
                                                                setSelectedProposal(proposal)

                                                                // Ürünleri ve diğer ayarları yükle
                                                                setProposalItems([...proposal.items])
                                                                setIsBlockList(proposal.isBlockList)

                                                                // Süreyi ayıkla (Örn: "2 Hafta" -> 2)
                                                                const duration = parseInt(proposal.usagePeriod || '1')
                                                                setDurationWeeks(isNaN(duration) ? 1 : duration)

                                                                // Dönemi ayıkla (Örn: "Ocak 1. Hafta - 2 Hafta")
                                                                if (proposal.weekInfo) {
                                                                    const parts = proposal.weekInfo.split(' ')
                                                                    if (parts.length >= 2) {
                                                                        const monthName = parts[0]
                                                                        const weekNum = parseInt(parts[1])
                                                                        const mIdx = monthNames.indexOf(monthName)
                                                                        if (mIdx !== -1) setStartMonth(mIdx + 1)
                                                                        if (!isNaN(weekNum)) setStartWeek(weekNum)
                                                                    }
                                                                }

                                                                // Bütçe sekmesine dön ve modalı aç
                                                                setActiveTab('proposals')
                                                                setShowProposalModal(true)

                                                                info('Teklif bilgileri yeni bütçe teklifi için kopyalandı.')
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                            Revize Et
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Bu teklifi silmek istediğinize emin misiniz?')) {
                                                            handleDeleteProposal(proposal.id)
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 ml-13">
                                        {proposal.items.map((item, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700">
                                                {item.quantity} {item.code}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Müşteri Kartı Modal */}
            {
                showCustomerModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-5 rounded-t-2xl flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">{selectedCustomer ? 'Müşteri Güncelle' : 'Yeni Müşteri Ekle'}</h2>
                                <button onClick={() => { setShowCustomerModal(false); setSelectedCustomer(null); }} className="text-white/80 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setCustomerModalTab('company')}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${customerModalTab === 'company'
                                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Building className="w-4 h-4" />
                                    Şirket Bilgileri
                                </button>
                                <button
                                    onClick={() => setCustomerModalTab('address')}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${customerModalTab === 'address'
                                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <MapPin className="w-4 h-4" />
                                    Adres
                                </button>
                                <button
                                    onClick={() => setCustomerModalTab('contact')}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${customerModalTab === 'contact'
                                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Phone className="w-4 h-4" />
                                    İletişim
                                </button>
                                <button
                                    onClick={() => setCustomerModalTab('notes')}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${customerModalTab === 'notes'
                                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <StickyNote className="w-4 h-4" />
                                    Notlar
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 space-y-4">
                                {/* Şirket Bilgileri Tab */}
                                {customerModalTab === 'company' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Şirket Unvanı <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={customerForm.companyName}
                                                onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Örn: ABC Holding A.Ş."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Ticari Unvan</label>
                                                <input
                                                    type="text"
                                                    value={customerForm.tradeName}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, tradeName: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Örn: ABC Grup"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Sektör</label>
                                                <select
                                                    value={customerForm.sector}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, sector: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                >
                                                    <option value="">Seçiniz</option>
                                                    <option value="reklam">Reklam</option>
                                                    <option value="perakende">Perakende</option>
                                                    <option value="uretim">Üretim</option>
                                                    <option value="hizmet">Hizmet</option>
                                                    <option value="teknoloji">Teknoloji</option>
                                                    <option value="diger">Diğer</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                                                <input
                                                    type="text"
                                                    value={customerForm.taxOffice}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, taxOffice: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Örn: Kordon"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                                                <input
                                                    type="text"
                                                    value={customerForm.taxNumber}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, taxNumber: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="10 haneli vergi numarası"
                                                />
                                            </div>
                                        </div>

                                    </>
                                )}

                                {/* Adres Tab */}
                                {customerModalTab === 'address' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                            <textarea
                                                value={customerForm.address}
                                                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Sokak, Mahalle, Bina No"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                                                <input
                                                    type="text"
                                                    value={customerForm.city}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Örn: İzmir"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                                                <input
                                                    type="text"
                                                    value={customerForm.district}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Örn: Konak"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                                            <input
                                                type="text"
                                                value={customerForm.postalCode}
                                                onChange={(e) => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Örn: 35000"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* İletişim Tab */}
                                {customerModalTab === 'contact' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Kişi</label>
                                            <input
                                                type="text"
                                                value={customerForm.contactPerson}
                                                onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Örn: Ahmet Yılmaz"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                                <input
                                                    type="tel"
                                                    value={customerForm.phone}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="+90 (XXX) XXX XX XX"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobil</label>
                                                <input
                                                    type="tel"
                                                    value={customerForm.mobile}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="+90 5XX XXX XX XX"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                            <input
                                                type="email"
                                                value={customerForm.email}
                                                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Örn: info@sirket.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                            <input
                                                type="url"
                                                value={customerForm.website}
                                                onChange={(e) => setCustomerForm({ ...customerForm, website: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Örn: www.sirket.com"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Notlar Tab */}
                                {customerModalTab === 'notes' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                                        <textarea
                                            value={customerForm.notes}
                                            onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            placeholder="Müşteri hakkında notlar..."
                                            rows={6}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowCustomerModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveCustomer}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div >
                )
            }


            {/* Bütçe Teklifi Modal */}
            {
                showProposalModal && selectedCustomer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Bütçe Teklifi Hazırla</h2>
                                    <p className="text-sm text-gray-500">{selectedCustomer.companyName}</p>
                                </div>
                                <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
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

                                    {proposalItems.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-center">
                                            <div className="flex-1 flex gap-2">
                                                <select
                                                    value={item.type}
                                                    onChange={(e) => updateProposalItem(index, 'type', e.target.value)}
                                                    className={`${(item.type === 'BB' || item.type === 'GB') ? 'w-1/2' : 'w-full'} px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500`}
                                                >
                                                    {getProductTypes().map((pt: any) => (
                                                        <option key={pt.code} value={pt.code}>{pt.code} - {pt.name}</option>
                                                    ))}
                                                </select>

                                                {(item.type === 'BB' || item.type === 'GB') && (
                                                    <div className="w-1/2">
                                                        <select
                                                            value={item.network || ''}
                                                            onChange={(e) => updateProposalItem(index, 'network', e.target.value)}
                                                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50 font-medium text-blue-700"
                                                        >
                                                            <option value="">-- Network Seçin --</option>
                                                            {Object.keys(networkCounts[item.type] || {}).sort().map(net => (
                                                                <option key={net} value={net}>
                                                                    Network {net} ({networkCounts[item.type][net]} adet)
                                                                </option>
                                                            ))}
                                                            {(!networkCounts[item.type] || Object.keys(networkCounts[item.type]).length === 0) && (
                                                                <option disabled>Network Bulunamadı</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateProposalItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Adet"
                                                readOnly={(item.type === 'BB' || item.type === 'GB') && !!item.network}
                                                min="0"
                                            />
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateProposalItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                                                className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="Birim Fiyat"
                                            />
                                            <span className="w-32 text-right font-medium">
                                                ₺{(item.quantity * item.unitPrice).toLocaleString()}
                                            </span>
                                            {proposalItems.length > 1 && (
                                                <button
                                                    onClick={() => removeProposalItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Blok Liste Seçeneği */}
                                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <input
                                        type="checkbox"
                                        id="blockList"
                                        checked={isBlockList}
                                        onChange={(e) => setIsBlockList(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <label htmlFor="blockList" className="text-sm text-gray-700">
                                        <strong>Blok Liste</strong> - Operasyon maliyeti tek sefer alınır
                                    </label>
                                </div>

                                {/* Hafta Bazlı Tarih Seçimi */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-semibold text-blue-800">Süre Bilgisi (Hafta Bazlı)</h4>

                                    {/* Başlangıç */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Ayı</label>
                                            <select
                                                value={startMonth}
                                                onChange={(e) => setStartMonth(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            >
                                                {monthNames.map((month, idx) => (
                                                    <option key={idx} value={idx + 1}>{month}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Haftası</label>
                                            <select
                                                value={startWeek}
                                                onChange={(e) => setStartWeek(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            >
                                                {[1, 2, 3, 4, 5].map(week => (
                                                    <option key={week} value={week}>{week}. Hafta</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Süre (Hafta) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Süre (Hafta)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max="52"
                                                value={durationWeeks}
                                                onChange={(e) => setDurationWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-500 whitespace-nowrap">Hafta</span>
                                        </div>
                                    </div>

                                    {/* Özet */}
                                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            📅 <strong>{getWeekRangeText()}</strong>
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Toplam: {durationWeeks} Hafta |
                                            Başlangıç: {formatWeekDate(startMonth, startWeek)}
                                        </p>
                                    </div>
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
                                        <span className="text-gray-600">Ürün Bedeli ({durationWeeks} Hafta):</span>
                                        <span className="font-medium">₺{calculateProductTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Operasyon Maliyeti {isBlockList ? '(Blok)' : '(Adet Başı)'}:
                                        </span>
                                        <span className="font-medium text-orange-600">₺{calculateOperationTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                                        <span className="text-gray-600">Ara Toplam:</span>
                                        <span className="font-medium">₺{calculateSubtotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">KDV (%{kdvRate}):</span>
                                        <span className="font-medium">₺{calculateKDV().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-primary-50 rounded-lg p-3 -mx-2">
                                        <span className="text-lg font-semibold text-gray-900">GENEL TOPLAM:</span>
                                        <span className="text-2xl font-bold text-primary-600">₺{calculateGrandTotal().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
                                <button
                                    onClick={() => setShowProposalModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={() => {
                                        const confirmed = window.confirm(
                                            `${selectedCustomer?.companyName} için hazırlanan bütçe teklifi:\n\n` +
                                            `Toplam: ₺${calculateGrandTotal().toLocaleString()}\n` +
                                            `Süre: ${durationWeeks} Hafta\n\n` +
                                            `Bu teklifi onaylayıp müşteriye e-posta ile göndermek istiyor musunuz?`
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

            {/* Yeni Müşteri Talebi Modalı */}
            {
                showRequestModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold">Yeni Müşteri Talebi</h2>
                                </div>
                                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                            <Hash className="w-4 h-4" />
                                            Vergi Numarası ile Ara
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Vergi numarasını girin..."
                                            value={requestForm.taxNumber}
                                            onChange={(e) => {
                                                const vkn = e.target.value
                                                setRequestForm({ ...requestForm, taxNumber: vkn })
                                                // VKN'ye göre müşteri bulma simülasyonu
                                                // Gerçekte burada bir API çağrısı veya müşteriler listesinde arama olur
                                            }}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                            <Users className="w-4 h-4" />
                                            Müşteri *
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={requestForm.customerId}
                                                onChange={(e) => setRequestForm({ ...requestForm, customerId: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                                required
                                            >
                                                <option value="">Müşteri Seçin...</option>
                                                {customers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.companyName}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Ürün Tipi *</label>
                                        <div className="relative">
                                            <select
                                                value={requestForm.productType}
                                                onChange={(e) => setRequestForm({ ...requestForm, productType: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                            >
                                                <option value="Billboard">Billboard</option>
                                                <option value="Megalight">Megalight</option>
                                                <option value="CLP">CLP Raket</option>
                                                <option value="Giantboard">Giantboard</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Ürün Detayları</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Boyut, konum tercihi vb."
                                            value={requestForm.productDetails}
                                            onChange={(e) => setRequestForm({ ...requestForm, productDetails: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                            <Hash className="w-4 h-4" />
                                            Adet
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={requestForm.quantity}
                                            onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Notlar</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Ek notlar..."
                                            value={requestForm.notes}
                                            onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                            <DollarSign className="w-4 h-4" />
                                            Bütçe Kaynağı
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={requestForm.budgetSource}
                                                onChange={(e) => setRequestForm({ ...requestForm, budgetSource: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                            >
                                                <option value="">Bütçe Seçin...</option>
                                                <option value="Genel Pazarlama">Genel Pazarlama</option>
                                                <option value="Tanıtım ve Etkinlik">Tanıtım ve Etkinlik</option>
                                                <option value="Lokal Reklam">Lokal Reklam</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-4">
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="px-6 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleCreateRequest}
                                    className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Modal for Location Request */}
            <LocationRequestModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
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

            {/* Email Modal */}
            {showEmailModal && (selectedProposal || selectedCustomer) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Teklifi E-posta ile Gönder</h3>
                                        <p className="text-sm text-gray-500">Rezervasyon@izmiracikhavareklam.com üzerinden</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Teklif No</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedProposal?.proposalNumber || selectedProposal?.id || 'Yeni Teklif'}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Müşteri</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedProposal?.customerName || selectedCustomer?.companyName}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {selectedCustomer?.email || 'E-posta bulunamadı'}
                                </p>
                            </div>
                            {!selectedProposal && (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <p className="text-sm text-green-700 font-medium">
                                        💡 Yeni teklif oluşturulacak ve e-posta ile gönderilecek.
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Toplam: ₺{calculateGrandTotal().toLocaleString()} | Süre: {durationWeeks} Hafta
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alıcı E-posta</label>
                                <input
                                    type="email"
                                    id="recipientEmail"
                                    defaultValue={selectedCustomer?.email || ''}
                                    placeholder="ornek@firma.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ek Mesaj (Opsiyonel)</label>
                                <textarea
                                    id="emailMessage"
                                    rows={3}
                                    placeholder="Müşteriye iletmek istediğiniz ek bir mesaj..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSendEmail}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}
