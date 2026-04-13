import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react'
import { inventoryService } from '../services/inventoryService'
import type { InventoryItem } from '../services/inventoryService'
import InventoryFormModal from '../components/inventory/InventoryFormModal'

export default function BuyukEnvanterPage() {
    const navigate = useNavigate()
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editing, setEditing] = useState<InventoryItem | undefined>(undefined)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const data = await inventoryService.getAll()
            setItems((data || []).filter(i => i.type === 'BE'))
        } catch (e) {
            console.error('Failed to fetch BE items:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setEditing(undefined)
        setIsFormOpen(true)
    }

    const handleEdit = (item: InventoryItem) => {
        setEditing(item)
        setIsFormOpen(true)
    }

    const handleSave = async (item: Partial<InventoryItem>) => {
        try {
            const payload = { ...item, type: 'BE' }
            if (editing) {
                await inventoryService.update(editing.id, payload)
            } else {
                await inventoryService.create(payload as any)
            }
            await fetchData()
            setIsFormOpen(false)
        } catch (e) {
            console.error('Failed to save BE item:', e)
            alert('Kaydetme başarısız oldu.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu büyük envanteri silmek istediğinize emin misiniz?')) return
        try {
            await inventoryService.delete(id)
            await fetchData()
        } catch (e) {
            console.error('Failed to delete BE item:', e)
            alert('Silme başarısız oldu.')
        }
    }

    const fmt = (n?: number) => (n == null ? '-' : `₺ ${Number(n).toLocaleString('tr-TR')}`)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/inventory')}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Envantere dön"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Büyük Envanter</h1>
                        <p className="text-gray-600 mt-1">Dönem ve fiyatlandırması envanter girişinde belirlenen özel envanterler</p>
                        <div className="flex items-center gap-3 mt-4">
                            <a
                                href="/IAR_BUYUK_ENVANTER.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-amber-100 transition-colors border border-amber-200"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                                Büyük Envanter PDF
                            </a>
                            <a
                                href="/IAR_BUYUK_NVANTER.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange-100 transition-colors border border-orange-200"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                                Büyük Envanter (Alternatif) PDF
                            </a>
                        </div>
                    </div>
                </div>
                <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Büyük Envanter Ekle
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kodu</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İlçe</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Adres</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dönem</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Liste Fiyatı</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İndirimli</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Baskı</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Op. Bedeli</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Henüz büyük envanter eklenmemiş.</td></tr>
                            ) : items.map(item => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-gray-700">{item.district}</td>
                                    <td className="px-4 py-3 text-gray-700">{item.address}</td>
                                    <td className="px-4 py-3 text-gray-700">{item.bePeriod || '-'}</td>
                                    <td className="px-4 py-3 text-gray-700">{fmt(item.beUnitPrice)}</td>
                                    <td className="px-4 py-3 text-gray-700">{fmt(item.beDiscountedPrice)}</td>
                                    <td className="px-4 py-3 text-gray-700">{fmt(item.bePrintingCost)}</td>
                                    <td className="px-4 py-3 text-gray-700">{fmt(item.beOperationCost)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Düzenle">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Sil">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <InventoryFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                initialData={editing}
            />
        </div>
    )
}
