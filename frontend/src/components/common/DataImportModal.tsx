import { useState, useRef, useEffect } from 'react'
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import {
    parseFile,
    suggestMappings,
    transformData,
    validateData,
    INVENTORY_FIELDS,
    BOOKING_FIELDS,
    PROPOSAL_FIELDS,
    type ParsedData,
    type ColumnMapping
} from '../../utils/fileParser'

interface DataImportModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (data: Record<string, any>[]) => Promise<void>
    entityType: 'inventory' | 'booking' | 'proposal'
    title?: string
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

export default function DataImportModal({
    isOpen,
    onClose,
    onImport,
    entityType,
    title = 'Veri İçe Aktar'
}: DataImportModalProps) {
    const [step, setStep] = useState<Step>('upload')
    const [isDragging, setIsDragging] = useState(false)
    const [parsedData, setParsedData] = useState<ParsedData | null>(null)
    const [mappings, setMappings] = useState<ColumnMapping[]>([])
    const [transformedData, setTransformedData] = useState<Record<string, any>[]>([])
    const [validationErrors, setValidationErrors] = useState<{ row: number; field: string; message: string }[]>([])
    const [importProgress, setImportProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fields = entityType === 'inventory' ? INVENTORY_FIELDS :
        entityType === 'booking' ? BOOKING_FIELDS : PROPOSAL_FIELDS

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep('upload')
            setParsedData(null)
            setMappings([])
            setTransformedData([])
            setValidationErrors([])
            setImportProgress(0)
            setError(null)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            await processFile(files[0])
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFile(e.target.files[0])
        }
    }

    const processFile = async (file: File) => {
        setError(null)
        try {
            const data = await parseFile(file)
            setParsedData(data)

            // Auto-suggest mappings
            const suggestedMappings = suggestMappings(data.headers, fields)
            setMappings(suggestedMappings)

            setStep('mapping')
        } catch (err) {
            setError((err as Error).message)
        }
    }

    const handleMappingChange = (targetField: string, sourceColumn: string) => {
        setMappings(prev => {
            const existing = prev.findIndex(m => m.targetField === targetField)
            if (sourceColumn === '') {
                // Remove mapping
                return prev.filter(m => m.targetField !== targetField)
            } else if (existing >= 0) {
                // Update mapping
                const updated = [...prev]
                updated[existing] = { ...updated[existing], sourceColumn }
                return updated
            } else {
                // Add new mapping
                return [...prev, { sourceColumn, targetField }]
            }
        })
    }

    const handlePreview = () => {
        if (!parsedData) return

        const transformed = transformData(parsedData, mappings, entityType)
        const { valid, errors } = validateData(transformed, fields)

        setTransformedData(valid)
        setValidationErrors(errors)
        setStep('preview')
    }

    const handleImport = async () => {
        if (transformedData.length === 0) return

        setStep('importing')
        setImportProgress(0)

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setImportProgress(prev => Math.min(prev + 10, 90))
            }, 200)

            await onImport(transformedData)

            clearInterval(progressInterval)
            setImportProgress(100)
            setStep('complete')
        } catch (err) {
            setError((err as Error).message)
            setStep('preview')
        }
    }

    const getMappedColumn = (fieldKey: string) => {
        return mappings.find(m => m.targetField === fieldKey)?.sourceColumn || ''
    }

    const renderUploadStep = () => (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
                relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200 ease-in-out
                ${isDragging
                    ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
            />
            <div className="flex flex-col items-center">
                <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center mb-4
                    transition-all duration-200
                    ${isDragging ? 'bg-primary-100 text-primary-600 scale-110' : 'bg-gray-100 text-gray-400'}
                `}>
                    <FileSpreadsheet className="w-10 h-10" />
                </div>
                <p className="text-gray-700 font-medium text-lg mb-2">
                    Excel veya CSV dosyasını sürükleyip bırakın
                </p>
                <p className="text-sm text-gray-500">
                    veya <span className="text-primary-600 font-medium">dosya seçmek için tıklayın</span>
                </p>
                <p className="text-xs text-gray-400 mt-4">
                    Desteklenen formatlar: .xlsx, .xls, .csv
                </p>
            </div>
        </div>
    )

    const renderMappingStep = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-900">{parsedData?.fileName}</p>
                        <p className="text-sm text-blue-700">{parsedData?.rows.length} satır veri bulundu</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-medium text-gray-900 mb-3">Sütun Eşleştirmesi</h4>
                <p className="text-sm text-gray-500 mb-4">
                    Dosyadaki sütunları sistem alanlarıyla eşleştirin. Otomatik eşleşmeler önerilmiştir.
                </p>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {fields.map(field => (
                        <div key={field.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-1/3">
                                <span className="font-medium text-gray-700">{field.label}</span>
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <select
                                value={getMappedColumn(field.key)}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                className="flex-1 input"
                            >
                                <option value="">-- Eşleşme yok --</option>
                                {parsedData?.headers.map(header => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderPreviewStep = () => (
        <div className="space-y-6">
            {validationErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-900">
                                {validationErrors.length} satırda hata bulundu
                            </p>
                            <p className="text-sm text-yellow-700">
                                Bu satırlar içe aktarılmayacak. Devam etmek için "İçe Aktar"a tıklayın.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-green-900">
                            {transformedData.length} satır içe aktarılmaya hazır
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto max-h-64 border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
                            {fields.filter(f => getMappedColumn(f.key)).map(field => (
                                <th key={field.key} className="px-3 py-2 text-left font-medium text-gray-600">
                                    {field.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transformedData.slice(0, 10).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                                {fields.filter(f => getMappedColumn(f.key)).map(field => (
                                    <td key={field.key} className="px-3 py-2 text-gray-900">
                                        {String(row[field.key] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transformedData.length > 10 && (
                    <div className="text-center py-2 text-sm text-gray-500 bg-gray-50">
                        ... ve {transformedData.length - 10} satır daha
                    </div>
                )}
            </div>
        </div>
    )

    const renderImportingStep = () => (
        <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Veriler İçe Aktarılıyor...</h3>
            <p className="text-gray-500 mb-6">{transformedData.length} kayıt işleniyor</p>
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
                <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                />
            </div>
            <p className="text-sm text-gray-500 mt-2">%{importProgress}</p>
        </div>
    )

    const renderCompleteStep = () => (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">İçe Aktarma Tamamlandı!</h3>
            <p className="text-gray-500">
                {transformedData.length} kayıt başarıyla eklendi
            </p>
        </div>
    )

    const renderContent = () => {
        switch (step) {
            case 'upload': return renderUploadStep()
            case 'mapping': return renderMappingStep()
            case 'preview': return renderPreviewStep()
            case 'importing': return renderImportingStep()
            case 'complete': return renderCompleteStep()
        }
    }

    const renderActions = () => {
        switch (step) {
            case 'upload':
                return (
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        İptal
                    </button>
                )
            case 'mapping':
                return (
                    <>
                        <button type="button" onClick={() => setStep('upload')} className="btn btn-secondary">
                            Geri
                        </button>
                        <button
                            onClick={handlePreview}
                            disabled={mappings.length === 0}
                            className="btn btn-primary"
                        >
                            Önizleme
                        </button>
                    </>
                )
            case 'preview':
                return (
                    <>
                        <button type="button" onClick={() => setStep('mapping')} className="btn btn-secondary">
                            Geri
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={transformedData.length === 0}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {transformedData.length} Kayıt İçe Aktar
                        </button>
                    </>
                )
            case 'complete':
                return (
                    <button type="button" onClick={onClose} className="btn btn-primary">
                        Kapat
                    </button>
                )
            default:
                return null
        }
    }

    const getStepTitle = () => {
        switch (step) {
            case 'upload': return 'Dosya Seç'
            case 'mapping': return 'Sütun Eşleştirme'
            case 'preview': return 'Önizleme'
            case 'importing': return 'İçe Aktarılıyor'
            case 'complete': return 'Tamamlandı'
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-3xl transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                {['upload', 'mapping', 'preview', 'complete'].map((s, i) => (
                                    <div key={s} className="flex items-center">
                                        <div className={`
                                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                            ${step === s ? 'bg-primary-600 text-white' :
                                                ['mapping', 'preview', 'complete'].indexOf(step) >= i ? 'bg-green-500 text-white' :
                                                    'bg-gray-200 text-gray-500'}
                                        `}>
                                            {i + 1}
                                        </div>
                                        {i < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
                                    </div>
                                ))}
                                <span className="ml-2 text-sm text-gray-500">{getStepTitle()}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-900">Hata</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="min-h-[300px]">
                        {renderContent()}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        {renderActions()}
                    </div>
                </div>
            </div>
        </div>
    )
}
