import { useState, useRef } from 'react'
import { X, Upload, FileText, Image, Film, Trash2, CheckCircle } from 'lucide-react'

interface FileUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (files: File[]) => Promise<void>
    title?: string
    acceptedTypes?: string
    maxFiles?: number
    entityType: 'inventory' | 'booking'
    entityId?: string
}

interface UploadedFile {
    file: File
    preview?: string
    status: 'pending' | 'uploading' | 'success' | 'error'
    progress: number
}

export default function FileUploadModal({
    isOpen,
    onClose,
    onUpload,
    title = 'Dosya Yükle',
    acceptedTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
    maxFiles = 10,
    entityType,
    entityId
}: FileUploadModalProps) {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(e.dataTransfer.files)
        addFiles(droppedFiles)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            addFiles(selectedFiles)
        }
    }

    const addFiles = (newFiles: File[]) => {
        const remainingSlots = maxFiles - files.length
        const filesToAdd = newFiles.slice(0, remainingSlots).map(file => ({
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            status: 'pending' as const,
            progress: 0
        }))
        setFiles(prev => [...prev, ...filesToAdd])
    }

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev]
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!)
            }
            newFiles.splice(index, 1)
            return newFiles
        })
    }

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />
        if (file.type.startsWith('video/')) return <Film className="w-6 h-6 text-purple-500" />
        return <FileText className="w-6 h-6 text-gray-500" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        setIsUploading(true)

        // Update all files to uploading status
        setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const, progress: 0 })))

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100))
                setFiles(prev => prev.map(f => ({ ...f, progress: i })))
            }

            await onUpload(files.map(f => f.file))

            // Mark all as success
            setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const, progress: 100 })))

            // Close after short delay
            setTimeout(() => {
                setFiles([])
                onClose()
            }, 1000)
        } catch (error) {
            console.error('Upload failed:', error)
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })))
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        // Cleanup previews
        files.forEach(f => {
            if (f.preview) URL.revokeObjectURL(f.preview)
        })
        setFiles([])
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {entityType === 'inventory' ? 'Envanter' : 'Rezervasyon'} için dosya ekleyin
                                {entityId && <span className="ml-1 text-primary-600">#{entityId.slice(0, 8)}</span>}
                            </p>
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
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
                            multiple
                            accept={acceptedTypes}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center">
                            <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center mb-4
                                transition-all duration-200
                                ${isDragging ? 'bg-primary-100 text-primary-600 scale-110' : 'bg-gray-100 text-gray-400'}
                            `}>
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-gray-700 font-medium mb-1">
                                Dosyaları sürükleyip bırakın
                            </p>
                            <p className="text-sm text-gray-500">
                                veya <span className="text-primary-600 font-medium">dosya seçmek için tıklayın</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Resim, PDF, Word, Excel • Maksimum {maxFiles} dosya
                            </p>
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-6 space-y-3 max-h-64 overflow-y-auto">
                            {files.map((uploadedFile, index) => (
                                <div
                                    key={index}
                                    className={`
                                        flex items-center gap-4 p-3 rounded-lg border transition-all
                                        ${uploadedFile.status === 'success' ? 'bg-green-50 border-green-200' :
                                            uploadedFile.status === 'error' ? 'bg-red-50 border-red-200' :
                                                'bg-gray-50 border-gray-200'}
                                    `}
                                >
                                    {/* Preview or Icon */}
                                    {uploadedFile.preview ? (
                                        <img
                                            src={uploadedFile.preview}
                                            alt="Preview"
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border">
                                            {getFileIcon(uploadedFile.file)}
                                        </div>
                                    )}

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {uploadedFile.file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(uploadedFile.file.size)}
                                        </p>

                                        {/* Progress Bar */}
                                        {uploadedFile.status === 'uploading' && (
                                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadedFile.progress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Status/Actions */}
                                    <div className="flex items-center gap-2">
                                        {uploadedFile.status === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : uploadedFile.status !== 'uploading' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeFile(index)
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isUploading}
                            className="btn btn-secondary"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={files.length === 0 || isUploading}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    {files.length > 0 ? `${files.length} Dosya Yükle` : 'Dosya Seç'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
