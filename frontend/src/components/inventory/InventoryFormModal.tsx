import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
// Use real types
import { type InventoryItem } from '../../services/inventoryService'

interface InventoryFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (item: Partial<InventoryItem>) => void
    initialData?: InventoryItem
}

export default function InventoryFormModal({ isOpen, onClose, onSave, initialData }: InventoryFormModalProps) {
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        code: '',
        type: 'BB',
        district: '',
        neighborhood: '',
        address: '',
        coordinates: '',
        network: '',
        is_active: true
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            setFormData({
                code: '',
                type: 'BB',
                district: '',
                neighborhood: '',
                address: '',
                coordinates: '',
                network: '',
                is_active: true
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData as InventoryItem)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? 'Envanter Düzenle' : 'Yeni Envanter Ekle'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Envanter Kodu
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="input w-full"
                                placeholder="Örn: BB0101"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tip
                            </label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="input w-full"
                            >
                                <option value="BB">Billboard (BB)</option>
                                <option value="CLP">Raket (CLP)</option>
                                <option value="GB">Giant Board (GB)</option>
                                <option value="MGL">Megalight (MGL)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                İlçe
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                className="input w-full"
                                placeholder="Örn: Karşıyaka"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mahalle
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.neighborhood}
                                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                className="input w-full"
                                placeholder="Örn: Bostanlı"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adres
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="input w-full"
                                placeholder="Tam adres giriniz"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Koordinatlar
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.coordinates}
                                onChange={e => setFormData({ ...formData, coordinates: e.target.value })}
                                className="input w-full"
                                placeholder="Örn: 38.46216, 27.10822"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enlem, Boylam formatında giriniz</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Network
                            </label>
                            <input
                                type="text"
                                value={formData.network}
                                onChange={e => setFormData({ ...formData, network: e.target.value })}
                                className="input w-full"
                                placeholder="Örn: 1, 2, BELEDİYE"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Durum
                            </label>
                            <select
                                value={formData.is_active ? 'ACTIVE' : 'MAINTENANCE'}
                                onChange={e => setFormData({ ...formData, is_active: e.target.value === 'ACTIVE' })}
                                className="input w-full"
                            >
                                <option value="ACTIVE">Aktif</option>
                                <option value="MAINTENANCE">Bakımda</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                        >
                            {initialData ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
