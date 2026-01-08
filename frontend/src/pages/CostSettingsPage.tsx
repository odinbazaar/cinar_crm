import { useState, useEffect } from 'react'
import {
    Save,
    DollarSign,
    Settings2,
    AlertCircle,
    Check,
    Info
} from 'lucide-react'

// Ürün tipi
interface ProductPrice {
    code: string
    name: string
    duration: string
    unitPrice: number
    operationCost: number
    isOperationPerUnit: boolean // true = adet başına, false = tek sefer (blok liste)
}

// Varsayılan fiyatlar
const defaultProducts: ProductPrice[] = [
    { code: 'BB', name: 'Billboard', duration: '1 Hafta', unitPrice: 3500, operationCost: 400, isOperationPerUnit: true },
    { code: 'CLP', name: 'CLP Raket', duration: '1 Hafta', unitPrice: 1200, operationCost: 150, isOperationPerUnit: true },
    { code: 'ML', name: 'Megalight', duration: '1 Hafta', unitPrice: 5000, operationCost: 500, isOperationPerUnit: true },
    { code: 'LED', name: 'LED Ekran', duration: '1 Hafta', unitPrice: 8000, operationCost: 0, isOperationPerUnit: false }, // LED dijital hariç
    { code: 'GB', name: 'Giantboard', duration: '10 Gün', unitPrice: 7500, operationCost: 600, isOperationPerUnit: true },
    { code: 'MB', name: 'Megaboard', duration: '1 Ay', unitPrice: 15000, operationCost: 1000, isOperationPerUnit: true },
    { code: 'KB', name: 'Kuleboard', duration: '1 Ay', unitPrice: 12000, operationCost: 800, isOperationPerUnit: true },
]

// KDV oranı seçenekleri
const KDV_RATES = [20, 14] as const

export default function CostSettingsPage() {
    const [products, setProducts] = useState<ProductPrice[]>(() => {
        const saved = localStorage.getItem('productPrices')
        return saved ? JSON.parse(saved) : defaultProducts
    })

    const [addressDifferenceFee, setAddressDifferenceFee] = useState<number>(() => {
        const saved = localStorage.getItem('addressDifferenceFee')
        return saved ? parseFloat(saved) : 500
    })

    const [kdvRate, setKdvRate] = useState<20 | 14>(() => {
        const saved = localStorage.getItem('kdvRate')
        return saved ? (parseInt(saved) as 20 | 14) : 20
    })

    const [saved, setSaved] = useState(false)

    const updateProduct = (index: number, field: keyof ProductPrice, value: number | boolean) => {
        const updated = [...products]
        updated[index] = { ...updated[index], [field]: value }
        setProducts(updated)
        setSaved(false)
    }

    const handleSave = () => {
        localStorage.setItem('productPrices', JSON.stringify(products))
        localStorage.setItem('addressDifferenceFee', addressDifferenceFee.toString())
        localStorage.setItem('kdvRate', kdvRate.toString())
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    // Örnek hesaplama
    const exampleCalculation = {
        product: products.find(p => p.code === 'BB') || products[0],
        quantity: 20,
        isBlockList: false
    }

    const exampleUnitTotal = exampleCalculation.quantity * exampleCalculation.product.unitPrice
    const exampleOperationTotal = exampleCalculation.isBlockList
        ? exampleCalculation.product.operationCost
        : exampleCalculation.quantity * exampleCalculation.product.operationCost
    const exampleSubtotal = exampleUnitTotal + exampleOperationTotal
    const exampleKDV = exampleSubtotal * (kdvRate / 100)
    const exampleTotal = exampleSubtotal + exampleKDV

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Maliyet Ayarları</h1>
                    <p className="text-gray-500">Ürün birim fiyatları ve operasyon maliyetlerini yönetin</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all shadow-lg ${saved
                        ? 'bg-green-600 text-white'
                        : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700'
                        }`}
                >
                    {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {saved ? 'Kaydedildi!' : 'Kaydet'}
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Hesaplama Mantığı:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li><strong>Birim Fiyat:</strong> Adet x Birim Fiyat = Ürün Bedeli</li>
                        <li><strong>Operasyon Maliyeti:</strong> Yapıştırma / Montaj bedeli (LED dijital hariç)</li>
                        <li><strong>Blok Liste:</strong> Operasyon maliyeti tek sefer alınır</li>
                        <li><strong>KDV:</strong> Toplam üzerine %{kdvRate} eklenir (seçilebilir: %20 veya %14)</li>
                    </ul>
                </div>
            </div>

            {/* Product Prices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary-600" />
                        Ürün Birim Fiyatları
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kod</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ürün Adı</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Süre</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Birim Fiyat (₺)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operasyon Bedeli (₺)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operasyon Tipi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product, index) => (
                                <tr key={product.code} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold bg-primary-100 text-primary-700">
                                            {product.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.duration}</td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                            <input
                                                type="number"
                                                value={product.unitPrice}
                                                onChange={(e) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-32 pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                            <input
                                                type="number"
                                                value={product.operationCost}
                                                onChange={(e) => updateProduct(index, 'operationCost', parseFloat(e.target.value) || 0)}
                                                className="w-32 pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                disabled={product.code === 'LED'}
                                            />
                                        </div>
                                        {product.code === 'LED' && (
                                            <p className="text-xs text-gray-500 mt-1">LED dijital hariç</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={product.isOperationPerUnit ? 'per-unit' : 'once'}
                                            onChange={(e) => updateProduct(index, 'isOperationPerUnit', e.target.value === 'per-unit')}
                                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                            disabled={product.code === 'LED'}
                                        >
                                            <option value="per-unit">Adet Başına</option>
                                            <option value="once">Tek Sefer (Blok)</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Optional Costs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Settings2 className="w-5 h-5 text-primary-600" />
                    Opsiyonel Maliyetler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adres Farkı Bedeli (Blok Liste Değilse)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                            <input
                                type="number"
                                value={addressDifferenceFee}
                                onChange={(e) => {
                                    setAddressDifferenceFee(parseFloat(e.target.value) || 0)
                                    setSaved(false)
                                }}
                                className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Liste blok olmaz ise çıkan adres farkı bedeli</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            KDV Oranı
                        </label>
                        <div className="flex gap-4">
                            {KDV_RATES.map((rate) => (
                                <label key={rate} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="kdvRate"
                                        value={rate}
                                        checked={kdvRate === rate}
                                        onChange={() => {
                                            setKdvRate(rate)
                                            setSaved(false)
                                        }}
                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className={`text-sm font-medium ${kdvRate === rate ? 'text-primary-600' : 'text-gray-700'}`}>
                                        %{rate}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Teklif için uygulanacak KDV oranı</p>
                    </div>
                </div>
            </div>

            {/* Example Calculation */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-primary-600" />
                    Örnek Hesaplama
                </h2>
                <div className="bg-white rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>Senaryo:</strong> {exampleCalculation.quantity} adet {exampleCalculation.product.name} ({exampleCalculation.product.duration})
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Ürün Bedeli:</span>
                            <span className="font-medium">
                                {exampleCalculation.quantity} {exampleCalculation.product.code} x {exampleCalculation.product.unitPrice.toLocaleString()} ₺ =
                                <span className="text-primary-600 ml-1">{exampleUnitTotal.toLocaleString()} ₺</span>
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Operasyon Maliyeti:</span>
                            <span className="font-medium">
                                {exampleCalculation.quantity} {exampleCalculation.product.code} x {exampleCalculation.product.operationCost.toLocaleString()} ₺ =
                                <span className="text-orange-600 ml-1">{exampleOperationTotal.toLocaleString()} ₺</span>
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Ara Toplam:</span>
                            <span className="font-medium">{exampleSubtotal.toLocaleString()} ₺</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">KDV (%{kdvRate}):</span>
                            <span className="font-medium text-gray-500">+{exampleKDV.toLocaleString()} ₺</span>
                        </div>
                        <div className="flex justify-between py-3 bg-primary-50 rounded-lg px-3 -mx-3">
                            <span className="text-gray-900 font-semibold">GENEL TOPLAM:</span>
                            <span className="text-xl font-bold text-primary-600">{exampleTotal.toLocaleString()} ₺</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
