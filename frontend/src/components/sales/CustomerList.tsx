import React, { useState, useMemo } from 'react'
import { Search, LayoutGrid, List, UserPlus, Building2, Mail, Phone, MapPin, FileText, RefreshCw, Trash2 } from 'lucide-react'
import type { Customer, CustomerForm, ProposalItem, Proposal } from '../../types/sales'

interface CustomerListProps {
    customers: Customer[]
    customerViewType: 'grid' | 'table'
    setCustomerViewType: (type: 'grid' | 'table') => void
    setShowCustomerModal: (show: boolean) => void
    setSelectedCustomer: (customer: Customer | null) => void
    setSelectedProposal: (proposal: Proposal | null) => void
    setProposalItems: (items: ProposalItem[]) => void
    setShowProposalModal: (show: boolean) => void
    setCustomerForm: (form: CustomerForm) => void
    handleDeleteCustomer: (id: string) => void
    getProductTypes: () => any[]
    isAdmin: boolean
}

export const CustomerList: React.FC<CustomerListProps> = ({
    customers,
    customerViewType,
    setCustomerViewType,
    setShowCustomerModal,
    setSelectedCustomer,
    setSelectedProposal,
    setProposalItems,
    setShowProposalModal,
    setCustomerForm,
    handleDeleteCustomer,
    getProductTypes,
    isAdmin
}) => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCustomers = useMemo(() => {
        const q = searchTerm.trim().toLocaleLowerCase('tr')
        if (!q) return customers
        return customers.filter((c) => {
            const fields = [
                c.companyName,
                (c as any).tradeName,
                c.contactPerson,
                c.email,
                c.phone,
                (c as any).mobile,
                (c as any).city,
                (c as any).district,
            ]
            return fields.some((v) => v && String(v).toLocaleLowerCase('tr').includes(q))
        })
    }, [customers, searchTerm])

    return (
        <div className="space-y-4 text-left">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Müşteri ara..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setCustomerViewType('grid')}
                            className={`p-2 rounded-lg transition-all ${customerViewType === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Kart Görünümü"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCustomerViewType('table')}
                            className={`p-2 rounded-lg transition-all ${customerViewType === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Tablo Görünümü"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCustomerModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/20 active:scale-95 transition-all"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="hidden sm:inline">Yeni Müşteri Kartı</span>
                        <span className="sm:hidden">Yeni</span>
                    </button>
                </div>
            </div>

            {customerViewType === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs text-gray-500">{customer.createdAt}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{customer.companyName}</h3>
                            <p className="text-sm text-gray-600 mb-3">{customer.contactPerson}</p>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium truncate block max-w-[200px]" title={customer.address}>{customer.address}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(customer)
                                        setSelectedProposal(null)
                                        const defaultProduct = getProductTypes()[0]
                                        setProposalItems([{ 
                                            type: defaultProduct.code, 
                                            code: defaultProduct.name, 
                                            quantity: 0, 
                                            unitPrice: defaultProduct.unitPrice, 
                                            discountedPrice: defaultProduct.discountedPrice || 0,
                                            printingCost: defaultProduct.printingCost,
                                            operationCost: defaultProduct.operationCost,
                                            weekLayout: '' 
                                        }])
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
                                            notes: (customer as any).notes || '',
                                            requestDetail: customer.requestDetail || '',
                                            calledPhone: customer.calledPhone || '',
                                            leadSource: customer.leadSource || '',
                                            leadStage: customer.leadStage || 'Aday'
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
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Şirket</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Yetkili</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">İletişim</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Şehir/İlçe</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kayıt Tarihi</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-xs">
                                                {customer.companyName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 line-clamp-1">{customer.companyName}</div>
                                                <div className="text-xs text-gray-500">{customer.tradeName || 'Ticari Unvan Belirtilmedi'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{customer.contactPerson}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{customer.email}</div>
                                        <div className="text-xs text-gray-400">{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{customer.city || '-'} / {customer.district || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {customer.createdAt}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(customer)
                                                    setSelectedProposal(null)
                                                    const defaultProduct = getProductTypes()[0]
                                                    setProposalItems([{ 
                                                        type: defaultProduct.code, 
                                                        code: defaultProduct.name, 
                                                        quantity: 0, 
                                                        unitPrice: defaultProduct.unitPrice, 
                                                        discountedPrice: defaultProduct.discountedPrice || 0,
                                                        printingCost: defaultProduct.printingCost,
                                                        operationCost: defaultProduct.operationCost,
                                                        weekLayout: '' 
                                                    }])
                                                    setShowProposalModal(true)
                                                }}
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Teklif Hazırla"
                                            >
                                                <FileText className="w-4 h-4" />
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
                                                        notes: (customer as any).notes || '',
                                                        requestDetail: customer.requestDetail || '',
                                                        calledPhone: customer.calledPhone || '',
                                                        leadSource: customer.leadSource || '',
                                                        leadStage: customer.leadStage || 'Aday'
                                                    })
                                                    setShowCustomerModal(true)
                                                }}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                title="Güncelle"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
