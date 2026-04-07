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
