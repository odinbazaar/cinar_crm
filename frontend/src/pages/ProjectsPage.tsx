import { useState, useEffect } from 'react'
import { Calendar, Search, Filter, Upload, Building2, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { bookingsService, inventoryService, proposalsService, type Booking, type InventoryItem, type Proposal } from '../services'
import NewBookingModal from '../components/bookings/NewBookingModal'
import DataImportModal from '../components/common/DataImportModal'

// Helper to extract brand from notes
const extractBrandFromNotes = (notes: string | undefined): string | null => {
    if (!notes) return null;
    const match = notes.match(/Marka:\s*([^,]+)/);
    return match ? match[1].trim() : null;
};

// Helper to extract network from notes
const extractNetworkFromNotes = (notes: string | undefined): string | null => {
    if (!notes) return null;
    const match = notes.match(/Network:\s*(\d+)/);
    return match ? `Network ${match[1]}` : null;
};

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [networkFilter, setNetworkFilter] = useState<string>('all')
    const [proposals, setProposals] = useState<Proposal[]>([])

    // Fetch bookings and inventory on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const [bookingsData, inventoryData, proposalsData] = await Promise.all([
                bookingsService.getAll(),
                inventoryService.getAll(),
                proposalsService.getAll()
            ])
            setBookings(bookingsData)
            setInventory(inventoryData)
            setProposals(proposalsData)
        } catch (err: any) {
            console.error('Failed to load data:', err)
            setError(err.message || 'Veriler yüklenirken bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveBooking = async (bookingData: any) => {
        try {
            if (editingBooking) {
                const updated = await bookingsService.update(editingBooking.id, {
                    start_date: bookingData.startDate,
                    end_date: bookingData.endDate,
                    status: bookingData.status,
                    notes: bookingData.notes || null,
                })
                // Also update client if possible or just refresh
                await loadData()
                setEditingBooking(null)
            } else {
                let itemsToBook: InventoryItem[] = []

                if (bookingData.inventoryItemId) {
                    // Single item selection
                    const item = inventory.find(i => i.id === bookingData.inventoryItemId)
                    if (item) itemsToBook = [item]
                } else if (bookingData.selectedNetwork) {
                    // Batch network selection
                    itemsToBook = inventory.filter(i => i.network === bookingData.selectedNetwork)
                }

                if (itemsToBook.length === 0) {
                    alert('Lütfen bir ünite veya network seçiniz.')
                    return
                }

                // Create bookings
                const createPromises = itemsToBook.map(item =>
                    bookingsService.create({
                        inventory_item_id: item.id,
                        start_date: bookingData.startDate,
                        end_date: bookingData.endDate,
                        status: bookingData.status,
                        notes: bookingData.notes || null,
                    })
                )

                await Promise.all(createPromises)
                await loadData()
            }
            setIsModalOpen(false)
        } catch (err: any) {
            console.error('Failed to save booking:', err)
            alert(err.message || 'Rezervasyon kaydedilirken bir hata oluştu')
        }
    }

    const handleEditClick = (booking: Booking) => {
        setEditingBooking(booking)
        setIsModalOpen(true)
    }

    const handleCancelBooking = async (bookingId: string) => {
        if (confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
            try {
                await bookingsService.update(bookingId, { status: 'CANCELLED' })
                setBookings(bookings.map(b =>
                    b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
                ))
            } catch (err: any) {
                console.error('Failed to cancel booking:', err)
                alert(err.message || 'Rezervasyon iptal edilirken bir hata oluştu')
            }
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingBooking(null)
    }

    const handleDataImport = async (data: Record<string, any>[]) => {
        console.log('Importing booking data:', data)
        for (const item of data) {
            try {
                await bookingsService.create(item as any)
            } catch (err) {
                console.error('Failed to import booking:', item, err)
            }
        }
        await loadData()
    }

    // Statistics
    const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length
    const optionCount = bookings.filter(b => b.status === 'OPTION').length
    const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length
    const totalCount = bookings.length

    const bookingsWithDetails = bookings.map(booking => {
        const item = inventory.find(i => i.id === booking.inventory_item_id)
        const brand = extractBrandFromNotes(booking.notes)
        const network = extractNetworkFromNotes(booking.notes)
        return {
            ...booking,
            item,
            brand,
            extractedNetwork: network
        }
    }).filter(b => {
        // Search filter
        const matchesSearch = (b.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.item?.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.brand || '').toLowerCase().includes(searchTerm.toLowerCase())

        // Status filter
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter

        // Network filter
        const matchesNetwork = networkFilter === 'all' || b.extractedNetwork === networkFilter

        return matchesSearch && matchesStatus && matchesNetwork
    })

    // Get unique networks for filter
    const uniqueNetworks = [...new Set(bookings.map(b => extractNetworkFromNotes(b.notes)).filter(Boolean))]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                            <Calendar className="w-6 h-6" />
                        </div>
                        Rezervasyonlar & Projeler
                    </h1>
                    <p className="text-gray-500 mt-1">Aktif kampanyalar ve rezervasyon takvimi</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Veri İçe Aktar</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingBooking(null)
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        + Yeni Rezervasyon
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                            <p className="text-sm text-gray-500">Toplam Rezervasyon</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
                            <p className="text-sm text-gray-500">Kesin</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 rounded-xl">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{optionCount}</p>
                            <p className="text-sm text-gray-500">Opsiyonlu</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
                            <p className="text-sm text-gray-500">İptal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Müşteri, envanter kodu veya marka ara..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="CONFIRMED">Kesin</option>
                            <option value="OPTION">Opsiyonlu</option>
                            <option value="CANCELLED">İptal</option>
                        </select>
                        <select
                            value={networkFilter}
                            onChange={(e) => setNetworkFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tüm Networkler</option>
                            {uniqueNetworks.map(n => (
                                <option key={n} value={n!}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Rezervasyonlar yükleniyor...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
                    <p className="font-medium">Hata!</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Bookings List */}
            {!isLoading && !error && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marka / Müşteri</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Envanter</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih Aralığı</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Network</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookingsWithDetails.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Henüz rezervasyon bulunmuyor
                                        </td>
                                    </tr>
                                ) : (
                                    bookingsWithDetails.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                                                        {(booking.brand || booking.client?.name || 'N/A').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {booking.brand || booking.client?.name || 'Belirlenmedi'}
                                                        </div>
                                                        {booking.brand && booking.client?.name && (
                                                            <div className="text-xs text-gray-500">{booking.client.name}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-900 font-medium">{booking.item?.code || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">{booking.item?.type} - {booking.item?.district}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>
                                                        {new Date(booking.start_date).toLocaleDateString('tr-TR')} - {new Date(booking.end_date).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                                    {booking.extractedNetwork || booking.item?.network || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : booking.status === 'OPTION'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {booking.status === 'CONFIRMED' && <CheckCircle className="w-3.5 h-3.5" />}
                                                    {booking.status === 'OPTION' && <Clock className="w-3.5 h-3.5" />}
                                                    {booking.status === 'CANCELLED' && <XCircle className="w-3.5 h-3.5" />}
                                                    {booking.status === 'CONFIRMED' ? 'Kesin' :
                                                        booking.status === 'OPTION' ? 'Opsiyonlu' :
                                                            'İptal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(booking)}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        İptal
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    {bookingsWithDetails.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Toplam <span className="font-medium text-gray-900">{bookingsWithDetails.length}</span> rezervasyon gösteriliyor
                            </p>
                        </div>
                    )}
                </div>
            )}

            <NewBookingModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleSaveBooking}
                initialData={editingBooking}
                inventory={inventory}
                proposals={proposals}
            />

            <DataImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleDataImport}
                entityType="booking"
                title="Rezervasyon Verisi İçe Aktar"
            />
        </div>
    )
}
