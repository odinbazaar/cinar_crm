export const STORAGE_KEY = 'productPrices_2026_v2'

export const getProductTypes = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        return JSON.parse(saved)
    }
    return [
        { code: 'BB', name: 'BILLBOARD', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 6500, discountedPrice: 4250, printingCost: 400, operationCost: 500 },
        { code: 'CLP', name: 'CLP RAKET', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 3000, discountedPrice: 2000, printingCost: 300, operationCost: 250 },
        { code: 'MGL', name: 'MEGALIGHT', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 12000, discountedPrice: 7500, printingCost: 1750, operationCost: 1200 },
        { code: 'LB', name: 'LED EKRAN', duration: '1 HAFTALIK', period: 'HAFTALIK', unitPrice: 15000, discountedPrice: 9000, printingCost: 0, operationCost: 0 },
        { code: 'GB', name: 'GIANTBOARD', duration: '10 GÜN', period: '10 GÜNLÜK', unitPrice: 85000, discountedPrice: 55000, printingCost: 4500, operationCost: 2500 },
        { code: 'KB', name: 'KULEBOARD', duration: '1 AY', period: 'AYLIK', unitPrice: 250000, discountedPrice: 180000, printingCost: 9600, operationCost: 15000 },
        { code: 'MB', name: 'MEGABOARD', duration: '1 AY', period: 'AYLIK', unitPrice: 175000, discountedPrice: 100000, printingCost: 3500, operationCost: 1500 },
        { code: 'BE', name: 'BÜYÜK ENVANTER', duration: '1 AY', period: 'AYLIK', unitPrice: 300000, discountedPrice: 200000, printingCost: 12000, operationCost: 18000 },
    ]
}

export const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

export const getWeeksInMonth = (month: number, year: number = 2026): number => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()
    return Math.ceil((daysInMonth + firstDayOfWeek) / 7)
}

export const getWeekStartDate = (month: number, week: number, year: number = 2026): Date => {
    const firstDay = new Date(year, month - 1, 1)
    const firstMonday = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek)
    firstMonday.setDate(1 + daysUntilMonday + (week - 1) * 7)
    return firstMonday
}

export const calculateProductTotal = (proposalItems: any[]) => {
    return proposalItems.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0
        if (qty <= 0) return sum
        const period = parseInt(item.weekLayout || '1') || 1
        const price = (Number(item.discountedPrice) > 0) ? Number(item.discountedPrice) : (Number(item.unitPrice) || 0)
        return sum + (qty * price * period)
    }, 0)
}

export const calculateOperationTotal = (proposalItems: any[]) => {
    return proposalItems.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0
        if (qty <= 0) return sum
        const opQty = Number(item.opQty) || 1
        return sum + ((Number(item.operationCost) || 0) * qty * opQty)
    }, 0)
}

export const calculatePrintingTotal = (proposalItems: any[]) => {
    return proposalItems.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0
        if (qty <= 0) return sum
        const opQty = Number(item.opQty) || 1
        return sum + ((Number(item.printingCost) || 0) * qty * opQty)
    }, 0)
}

export const calculateSubtotal = (proposalItems: any[]) => {
    return calculateProductTotal(proposalItems) + 
           calculateOperationTotal(proposalItems) + 
           calculatePrintingTotal(proposalItems)
}

export const calculateKDV = (proposalItems: any[], kdvRate: number) => {
    return calculateSubtotal(proposalItems) * (kdvRate / 100)
}

export const calculateGrandTotal = (proposalItems: any[], kdvRate: number) => {
    return calculateSubtotal(proposalItems) + 
           calculateKDV(proposalItems, kdvRate)
}

export const calculateTotalWeeks = (startMonth: number, startWeek: number, duration: number) => {
    return duration
}

export const formatWeekDate = (date: Date) => {
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

export const getWeekRangeText = (startMonth: number, startWeek: number, duration: number) => {
    const startDate = getWeekStartDate(startMonth, startWeek)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (duration * 7) - 1)
    return `${formatWeekDate(startDate)} - ${formatWeekDate(endDate)}`
}

// ====== Ürün Tipine Göre Dönem/Tarih Hesaplama Fonksiyonları ======

/**
 * Ürün tipine göre takvim türünü döndürür.
 * - 'weekly': BB, CLP, MGL, LB (Haftalık - Pazartesi başlar)
 * - 'tenday': GB (10 Günlük - Ayın 1, 11, 21)
 * - 'monthly': KB, MB, BE (Aylık - Ayın 1'i)
 */
export type ScheduleType = 'weekly' | 'tenday' | 'monthly'

export const getScheduleType = (productCode: string): ScheduleType => {
    const code = productCode.toUpperCase()
    if (['BB', 'CLP', 'MGL', 'LB'].includes(code)) return 'weekly'
    if (code === 'GB') return 'tenday'
    if (['KB', 'MB', 'BE'].includes(code)) return 'monthly'
    // Fallback: haftalık
    return 'weekly'
}

/**
 * Verilen tarihe göre o ürün tipi için geçerli dönem başlangıç tarihini hesaplar.
 * - weekly: Verilen tarihten itibaren en yakın Pazartesi (bugün Pazartesi ise bugün)
 * - tenday: Verilen tarihten itibaren en yakın 1, 11 veya 21 (bugün bu günlerden biri ise bugün)
 * - monthly: Verilen tarihten itibaren en yakın ayın 1'i (bugün 1 ise bugün)
 */
export const getNextPeriodStartDate = (productCode: string, fromDate?: Date): Date => {
    const scheduleType = getScheduleType(productCode)
    const date = fromDate ? new Date(fromDate) : new Date()
    // Saat bilgisini sıfırla
    date.setHours(0, 0, 0, 0)

    switch (scheduleType) {
        case 'weekly': {
            // En yakın Pazartesi
            const dayOfWeek = date.getDay() // 0=Pazar, 1=Pazartesi, ...
            if (dayOfWeek === 1) return date // Bugün Pazartesi
            const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek)
            const monday = new Date(date)
            monday.setDate(date.getDate() + daysUntilMonday)
            return monday
        }
        case 'tenday': {
            // En yakın 1, 11 veya 21
            const day = date.getDate()
            if (day === 1 || day === 11 || day === 21) return date
            
            if (day < 11) {
                return new Date(date.getFullYear(), date.getMonth(), 11)
            } else if (day < 21) {
                return new Date(date.getFullYear(), date.getMonth(), 21)
            } else {
                // Sonraki ayın 1'i
                return new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        }
        case 'monthly': {
            // En yakın ayın 1'i
            const day = date.getDate()
            if (day === 1) return date
            // Sonraki ayın 1'i
            return new Date(date.getFullYear(), date.getMonth() + 1, 1)
        }
        default:
            return date
    }
}

/**
 * Başlangıç tarihinden itibaren dönem sayısına göre bitiş tarihini hesaplar.
 * - weekly: her dönem 7 gün
 * - tenday: her dönem 10 gün (1→10, 11→20, 21→ay sonu)
 * - monthly: her dönem 1 ay
 * @param productCode Ürün kodu
 * @param startDate Başlangıç tarihi
 * @param periods Dönem sayısı (default: 1)
 * @returns Bitiş tarihi (dönemin son günü, dahil)
 */
export const calculatePeriodEndDate = (productCode: string, startDate: Date, periods: number = 1): Date => {
    const scheduleType = getScheduleType(productCode)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    switch (scheduleType) {
        case 'weekly': {
            const end = new Date(start)
            end.setDate(start.getDate() + (periods * 7) - 1)
            return end
        }
        case 'tenday': {
            // 10 günlük periyotlar: 1-10, 11-20, 21-ayın son günü
            let current = new Date(start)
            for (let i = 0; i < periods; i++) {
                const day = current.getDate()
                if (day === 1) {
                    if (i === periods - 1) {
                        return new Date(current.getFullYear(), current.getMonth(), 10)
                    }
                    current = new Date(current.getFullYear(), current.getMonth(), 11)
                } else if (day === 11) {
                    if (i === periods - 1) {
                        return new Date(current.getFullYear(), current.getMonth(), 20)
                    }
                    current = new Date(current.getFullYear(), current.getMonth(), 21)
                } else if (day === 21) {
                    // Ayın son günü
                    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
                    if (i === periods - 1) {
                        return new Date(current.getFullYear(), current.getMonth(), lastDay)
                    }
                    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
                } else {
                    // Fallback
                    if (i === periods - 1) {
                        const end = new Date(current)
                        end.setDate(current.getDate() + 9)
                        return end
                    }
                    current.setDate(current.getDate() + 10)
                }
            }
            return current
        }
        case 'monthly': {
            const end = new Date(start.getFullYear(), start.getMonth() + periods, 0) // Ayın son günü
            return end
        }
        default: {
            const end = new Date(start)
            end.setDate(start.getDate() + (periods * 7) - 1)
            return end
        }
    }
}

/**
 * Ürün tipine göre dönem etiketi döndürür (UI'da gösterilecek)
 */
export const getPeriodLabel = (productCode: string): string => {
    const scheduleType = getScheduleType(productCode)
    switch (scheduleType) {
        case 'weekly': return 'Hafta'
        case 'tenday': return '10 Gün'
        case 'monthly': return 'Ay'
        default: return 'Dönem'
    }
}

/**
 * Ürün tipine göre dönem başlangıç tarihi seçeneklerini döndürür.
 * UI'da dropdown / tarih seçici olarak kullanılabilir.
 * @param productCode Ürün kodu
 * @param year Yıl
 * @param monthIndex 0-indexed ay (0=Ocak)
 * @returns Tarih dizisi
 */
export const getPeriodStartDatesForMonth = (productCode: string, year: number, monthIndex: number): Date[] => {
    const scheduleType = getScheduleType(productCode)
    const dates: Date[] = []

    switch (scheduleType) {
        case 'weekly': {
            // O aydaki tüm Pazartesi günleri
            const firstDay = new Date(year, monthIndex, 1)
            const lastDay = new Date(year, monthIndex + 1, 0)
            const current = new Date(firstDay)
            
            // İlk Pazartesiyi bul
            const dayOfWeek = current.getDay()
            const daysUntilMonday = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : (8 - dayOfWeek))
            current.setDate(current.getDate() + daysUntilMonday)
            
            while (current <= lastDay) {
                dates.push(new Date(current))
                current.setDate(current.getDate() + 7)
            }
            break
        }
        case 'tenday': {
            // 1, 11, 21
            dates.push(new Date(year, monthIndex, 1))
            dates.push(new Date(year, monthIndex, 11))
            dates.push(new Date(year, monthIndex, 21))
            break
        }
        case 'monthly': {
            // Sadece ayın 1'i
            dates.push(new Date(year, monthIndex, 1))
            break
        }
    }

    return dates
}

/**
 * Tarih formatını YYYY-MM-DD olarak döndürür (input[type=date] için)
 */
export const formatDateForInput = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}
