import { useState } from 'react'
import { Settings, Save, X, Calendar as CalendarIcon, Info } from 'lucide-react'

// Types
export interface WeekDefinition {
    id: string
    year: number
    productType: string // 'default' | 'billboard' | 'clp' etc.
    startDayOfWeek: number // 0 (Sunday) to 6 (Saturday) - standard JS
    firstWeekLogic: 'first_day' | 'first_full_week' | 'first_weekday'
    firstWeekDay?: number // If logic is 'first_weekday', which day it is
}

interface CalendarSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (settings: WeekDefinition[]) => void
}

// Default settings
const defaultSettings: WeekDefinition[] = [
    {
        id: '1',
        year: 2026,
        productType: 'default',
        startDayOfWeek: 1, // Monday
        firstWeekLogic: 'first_day'
    },
    {
        id: '2',
        year: 2026,
        productType: 'billboard',
        startDayOfWeek: 1, // Monday
        firstWeekLogic: 'first_weekday',
        firstWeekDay: 1 // First Monday of the year
    }
]

export default function CalendarSettingsModal({ isOpen, onClose, onSave }: CalendarSettingsModalProps) {
    const [settings, setSettings] = useState<WeekDefinition[]>(defaultSettings)
    const [activeTab, setActiveTab] = useState<'general' | 'products'>('general')

    if (!isOpen) return null

    const handleSave = () => {
        onSave(settings)
        onClose()
    }

    const updateSetting = (index: number, field: keyof WeekDefinition, value: any) => {
        const newSettings = [...settings]
        newSettings[index] = { ...newSettings[index], [field]: value }
        setSettings(newSettings)
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideDown">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Takvim Ayarları</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'general'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Genel Ayarlar
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'products'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Ürün Bazlı Ayarlar
                        </button>
                    </div>

                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p>Genel takvim ayarları tüm sistem için varsayılan olarak kullanılır.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Varsayılan Yıl
                                    </label>
                                    <input
                                        type="number"
                                        value={settings[0].year}
                                        onChange={(e) => updateSetting(0, 'year', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hafta Başlangıç Günü
                                    </label>
                                    <select
                                        value={settings[0].startDayOfWeek}
                                        onChange={(e) => updateSetting(0, 'startDayOfWeek', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value={1}>Pazartesi</option>
                                        <option value={2}>Salı</option>
                                        <option value={3}>Çarşamba</option>
                                        <option value={4}>Perşembe</option>
                                        <option value={5}>Cuma</option>
                                        <option value={6}>Cumartesi</option>
                                        <option value={0}>Pazar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 p-4 rounded-lg flex gap-3 text-sm text-amber-800">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p>Ürün bazlı ayarlar, farklı ürün tipleri için özel hafta döngüleri (52 hafta) tanımlamanızı sağlar.</p>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Billboard Ayarları (2026)
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hafta Başlangıç Günü
                                            </label>
                                            <select
                                                value={settings[1].startDayOfWeek}
                                                onChange={(e) => updateSetting(1, 'startDayOfWeek', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value={1}>Pazartesi</option>
                                                <option value={2}>Salı</option>
                                                <option value={3}>Çarşamba</option>
                                                <option value={4}>Perşembe</option>
                                                <option value={5}>Cuma</option>
                                                <option value={6}>Cumartesi</option>
                                                <option value={0}>Pazar</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                İlk Hafta Kuralı
                                            </label>
                                            <select
                                                value={settings[1].firstWeekLogic}
                                                onChange={(e) => updateSetting(1, 'firstWeekLogic', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="first_day">Yılın İlk Günü</option>
                                                <option value="first_full_week">Yılın İlk Tam Haftası</option>
                                                <option value="first_weekday">Yılın İlk [Gün]ü</option>
                                            </select>
                                        </div>
                                    </div>

                                    {settings[1].firstWeekLogic === 'first_weekday' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hangi günden başlasın?
                                            </label>
                                            <select
                                                value={settings[1].firstWeekDay}
                                                onChange={(e) => updateSetting(1, 'firstWeekDay', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value={1}>İlk Pazartesi</option>
                                                <option value={2}>İlk Salı</option>
                                                <option value={3}>İlk Çarşamba</option>
                                                <option value={4}>İlk Perşembe</option>
                                                <option value={5}>İlk Cuma</option>
                                                <option value={6}>İlk Cumartesi</option>
                                                <option value={0}>İlk Pazar</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Örn: "Yılın ilk Pazartesisi" seçildiğinde, 2026 yılı takvimi 5 Ocak Pazartesi günü başlar.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Ayarları Kaydet
                    </button>
                </div>
            </div>
        </div>
    )
}
