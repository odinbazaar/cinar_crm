import { useState, useEffect } from 'react'
import {
    Save,
    DollarSign,
    Settings2,
    AlertCircle,
    Check,
    Info,
    RefreshCw
} from 'lucide-react'

// Ürün tipi
interface ProductPrice {
    code: string
    name: string
    duration: string
    period: string
    unitPrice: number
    discountedPrice: number
    printingCost: number
    operationCost: number
    isOperationPerUnit: boolean // true = adet başına, false = tek sefer (blok liste)
}

const STORAGE_KEY = 'productPrices_2026_v2'

const defaultProducts: ProductPrice[] = [
    { code: 'BB', name: 'BILLBOARD', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 6500, discountedPrice: 4250, printingCost: 400, operationCost: 500, isOperationPerUnit: true },
    { code: 'CLP', name: 'CLP RAKET', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 3000, discountedPrice: 2000, printingCost: 300, operationCost: 250, isOperationPerUnit: true },
    { code: 'MGL', name: 'MEGALIGHT', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 12000, discountedPrice: 7500, printingCost: 1750, operationCost: 1200, isOperationPerUnit: true },
    { code: 'LB', name: 'LED EKRAN', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 15000, discountedPrice: 9000, printingCost: 0, operationCost: 0, isOperationPerUnit: false },
    { code: 'GB', name: 'GIANTBOARD', duration: '10 GÜN', period: '10 GÜNLÜK', unitPrice: 85000, discountedPrice: 55000, printingCost: 4500, operationCost: 2500, isOperationPerUnit: true },
    { code: 'KB', name: 'KULEBOARD', duration: '1 AY', period: 'AYLIK', unitPrice: 250000, discountedPrice: 180000, printingCost: 9600, operationCost: 15000, isOperationPerUnit: true },
    { code: 'MB', name: 'MEGABOARD', duration: '1 AY', period: 'AYLIK', unitPrice: 175000, discountedPrice: 100000, printingCost: 3500, operationCost: 1500, isOperationPerUnit: true },
    { code: 'BE', name: 'BÜYÜK ENVANTER', duration: '3 AY', period: '3 AYLIK', unitPrice: 0, discountedPrice: 0, printingCost: 0, operationCost: 0, isOperationPerUnit: true },
]

// KDV oranı seçenekleri
const KDV_RATES = [20, 14] as const

export default function CostSettingsPage() {
    const [products, setProducts] = useState<ProductPrice[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
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

    const updateProduct = (index: number, field: keyof ProductPrice, value: number | boolean | string) => {
        const updated = [...products]
        updated[index] = { ...updated[index], [field]: value }
        setProducts(updated)
        setSaved(false)
    }

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (confirm('Tüm fiyatları yeni 2026 tarifesine sıfırlamak istediğinize emin misiniz?')) {
                                setProducts(defaultProducts)
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts))
                                setSaved(true)
                                setTimeout(() => setSaved(false), 3000)
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all border border-red-200 text-red-600 hover:bg-red-50"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Fabrika Ayarlarına Dön
                    </button>
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Süre / Dönem</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liste Fiyatı (₺)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase text-green-700">İndirimli Fiyat (₺)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase text-orange-600">Baskı Fiyatı (₺)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Op. Bedeli (₺)</th>
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
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-gray-400">Süre: {product.duration}</span>
                                            <input
                                                type="text"
                                                value={product.period}
                                                onChange={(e) => updateProduct(index, 'period', e.target.value)}
                                                className="w-24 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-primary-500"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                                            <input
                                                type="number"
                                                value={product.unitPrice}
                                                onChange={(e) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-28 pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">₺</span>
                                            <input
                                                type="number"
                                                value={product.discountedPrice}
                                                onChange={(e) => updateProduct(index, 'discountedPrice', parseFloat(e.target.value) || 0)}
                                                className="w-28 pl-8 pr-3 py-2 border border-green-200 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-bold text-green-700"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 font-bold">₺</span>
                                            <input
                                                type="number"
                                                value={product.printingCost}
                                                onChange={(e) => updateProduct(index, 'printingCost', parseFloat(e.target.value) || 0)}
                                                className="w-24 pl-8 pr-2 py-2 border border-orange-200 bg-orange-50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs font-bold text-orange-700"
                                                disabled={product.code === 'LB'}
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
                                                className="w-24 pl-8 pr-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs"
                                                disabled={product.code === 'LB'}
                                            />
                                        </div>
                                        {product.code === 'LB' && (
                                            <p className="text-[10px] text-gray-500 mt-1">LED dijital hariç</p>
                                        )}
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
