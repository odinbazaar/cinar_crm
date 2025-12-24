import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast } from '../hooks/useToast'

interface ToastContainerProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    const getIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />
            case 'error':
                return <AlertCircle className="w-5 h-5" />
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />
            case 'info':
                return <Info className="w-5 h-5" />
        }
    }

    const getStyles = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800'
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800'
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800'
        }
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${getStyles(toast.type)}`}
                >
                    <div className="flex-shrink-0">{getIcon(toast.type)}</div>
                    <p className="flex-1 text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
