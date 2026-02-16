export interface Customer {
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
    requestDetail?: string
    calledPhone?: string
    leadSource?: string
    leadStage?: string
}

export interface CustomerForm {
    companyName: string
    tradeName: string
    sector: string
    taxOffice: string
    taxNumber: string
    status: string
    address: string
    city: string
    district: string
    postalCode: string
    contactPerson: string
    email: string
    phone: string
    mobile: string
    website: string
    notes: string
    requestDetail: string
    calledPhone: string
    leadSource: string
    leadStage: string
}

export interface ProposalItem {
    type: string
    code: string
    description?: string
    quantity: number
    unitPrice: number
    discountedPrice?: number
    printingCost: number
    operationCost: number
    network?: string
    weekLayout?: string
}

export interface Proposal {
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

export interface CustomerRequest {
    id: string
    requestNumber: string
    customerId: string
    customerName: string
    productType: string
    productDetails: string
    quantity: number
    notes: string
    budgetSource: string
    status: 'pending' | 'approved' | 'rejected' | 'checked_by_ops' | 'completed' | 'cancelled' | 'in_progress'
    createdAt: string
    brandName?: string
}
