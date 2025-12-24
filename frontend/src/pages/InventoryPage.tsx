import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Map, Upload } from 'lucide-react'
// Remove mock data import and use service
import { inventoryService } from '../services/inventoryService'
import type { InventoryItem } from '../services/inventoryService'
import InventoryFormModal from '../components/inventory/InventoryFormModal'
import InventoryMapModal from '../components/inventory/InventoryMapModal'
import DataImportModal from '../components/common/DataImportModal'

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<string>('ALL')

    // State for inventory data
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    // Filter type options derived from data or static if preferred
    const filterTypes = ['BB', 'CLP', 'GB', 'MGL']

    // State for modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined)
    const [isMapModalOpen, setIsMapModalOpen] = useState(false)
    const [mapItem, setMapItem] = useState<InventoryItem | undefined>(undefined)
    const [isImportOpen, setIsImportOpen] = useState(false)

    // Fetch inventory on mount
    useEffect(() => {
        fetchInventory()
    }, [])

    const fetchInventory = async () => {
        try {
            setLoading(true)
            const data = await inventoryService.getAll()
            setInventory(data)
        } catch (error) {
            console.error('Failed to fetch inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredInventory = inventory.filter(item => {
        const matchesSearch =
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.neighborhood || '').toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterType === 'ALL' || item.type === filterType

        return matchesSearch && matchesFilter
    })

    const handleAddNew = () => {
        setEditingItem(undefined)
        setIsFormModalOpen(true)
    }

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item)
        setIsFormModalOpen(true)
    }

    const handleMap = (item: InventoryItem) => {
        setMapItem(item)
        setIsMapModalOpen(true)
    }

    const handleDataImport = async (data: Record<string, any>[]) => {
        console.log('Importing inventory data:', data)
        // Import each row to the database
        for (const item of data) {
            try {
                await inventoryService.create(item as any)
            } catch (err) {
                console.error('Failed to import item:', item, err)
            }
        }
        // Refresh the inventory list
        await fetchInventory()
    }

    const handleSave = async (item: Partial<InventoryItem>) => {
        try {
            if (editingItem) {
                // Update existing item
                await inventoryService.update(editingItem.id, item)
            } else {
                // Add new item
                await inventoryService.create(item as any)
            }
            // Refresh list
            fetchInventory()
            setIsFormModalOpen(false)
        } catch (error) {
            console.error('Failed to save inventory item:', error)
            alert('Kaydetme başarısız oldu.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Envanter Yönetimi</h1>
                    <p className="text-gray-600 mt-1">Billboard, CLP, Megalight ve diğer reklam alanları</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Veri İçe Aktar
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Envanter Ekle
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Kod, adres veya semt ara..."
                            className="input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <button
                            onClick={() => setFilterType('ALL')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilterType('BB')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'BB' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                        >
                            Billboard (BB)
                        </button>
                        <button
                            onClick={() => setFilterType('CLP')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'CLP' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                }`}
                        >
                            Raket (CLP)
                        </button>
                        <button
                            onClick={() => setFilterType('GB')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'GB' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                }`}
                        >
                            Giant Board (GB)
                        </button>
                        <button
                            onClick={() => setFilterType('MGL')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'MGL' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                        >
                            Megalight (MGL)
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            {/* Inventory Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Kodu</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Tip</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">İlçe</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Mahalle</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-1/3">Adres</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Network</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Durum</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredInventory.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                        {item.code}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                        <span className={`
                                            inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold
                                            ${item.type === 'BB' ? 'bg-blue-100 text-blue-700' :
                                                item.type === 'CLP' ? 'bg-purple-100 text-purple-700' :
                                                    item.type === 'GB' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'}
                                        `}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                        {item.district}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                        {item.neighborhood || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 truncate max-w-xs" title={item.address}>
                                        {item.address}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 whitespace-nowrap">
                                        {item.network ? `Network ${item.network}` : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-sm border-r border-gray-200 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.is_active ? 'Aktif' : 'Bakımda'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-primary-600 hover:text-primary-900 font-medium text-xs flex items-center gap-1"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleMap(item)}
                                                className="text-gray-500 hover:text-gray-900 font-medium text-xs flex items-center gap-1"
                                            >
                                                <Map className="w-3 h-3" />
                                                Harita
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <InventoryFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
            />

            {mapItem && (
                <InventoryMapModal
                    isOpen={isMapModalOpen}
                    onClose={() => setIsMapModalOpen(false)}
                    coordinates={mapItem.coordinates || ''}
                    title={`${mapItem.code} - ${mapItem.address}`}
                />
            )}

            <DataImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleDataImport}
                entityType="inventory"
                title="Envanter Verisi İçe Aktar"
            />
        </div>
    )
}
