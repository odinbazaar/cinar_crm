import { useToast as useToastHook } from '../context/ToastContext'

export type { Toast, ToastType } from '../context/ToastContext'

export function useToast() {
    return useToastHook()
}
