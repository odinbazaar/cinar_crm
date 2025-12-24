import { X } from 'lucide-react'

interface InventoryMapModalProps {
    isOpen: boolean
    onClose: () => void
    coordinates: string
    title: string
}

export default function InventoryMapModal({ isOpen, onClose, coordinates, title }: InventoryMapModalProps) {
    if (!isOpen) return null

    // Clean coordinates and ensure they are in the correct format
    const cleanCoordinates = coordinates.replace(/\s/g, '')

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Konum: {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 bg-gray-100 relative">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={`https://maps.google.com/maps?q=${cleanCoordinates}&z=15&output=embed`}
                        title={title}
                        className="absolute inset-0"
                    ></iframe>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
                    <span>Koordinatlar: {coordinates}</span>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${cleanCoordinates}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                        Google Haritalar'da Aç
                    </a>
                </div>
            </div>
        </div>
    )
}
