import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface UseToastReturn {
    toasts: Toast[]
    showToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
}

export function useToast(): UseToastReturn {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = 3000) => {
            const id = Math.random().toString(36).substring(2, 9)
            const toast: Toast = { id, message, type, duration }

            setToasts((prev) => [...prev, toast])

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id)
                }, duration)
            }
        },
        [removeToast]
    )

    const success = useCallback(
        (message: string, duration?: number) => showToast(message, 'success', duration),
        [showToast]
    )

    const error = useCallback(
        (message: string, duration?: number) => showToast(message, 'error', duration),
        [showToast]
    )

    const warning = useCallback(
        (message: string, duration?: number) => showToast(message, 'warning', duration),
        [showToast]
    )

    const info = useCallback(
        (message: string, duration?: number) => showToast(message, 'info', duration),
        [showToast]
    )

    return {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
    }
}
