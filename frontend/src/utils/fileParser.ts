import * as XLSX from 'xlsx'

export interface ParsedData {
    headers: string[]
    rows: Record<string, any>[]
    fileName: string
    sheetName?: string
}

export interface ColumnMapping {
    sourceColumn: string
    targetField: string
    sampleValue?: any
}

// Field definitions for each entity type
export const INVENTORY_FIELDS = [
    { key: 'code', label: 'Kod', required: true },
    { key: 'type', label: 'Tip (BB/CLP/GB/MGL)', required: true },
    { key: 'address', label: 'Adres', required: true },
    { key: 'district', label: 'İlçe', required: false },
    { key: 'neighborhood', label: 'Mahalle', required: false },
    { key: 'network', label: 'Network', required: false },
    { key: 'coordinates', label: 'Koordinatlar', required: false },
    { key: 'width', label: 'Genişlik', required: false },
    { key: 'height', label: 'Yükseklik', required: false },
    { key: 'is_active', label: 'Aktif mi?', required: false },
]

export const BOOKING_FIELDS = [
    { key: 'inventory_item_id', label: 'Envanter ID', required: true },
    { key: 'client_id', label: 'Müşteri ID', required: false },
    { key: 'project_id', label: 'Proje ID', required: false },
    { key: 'start_date', label: 'Başlangıç Tarihi', required: true },
    { key: 'end_date', label: 'Bitiş Tarihi', required: true },
    { key: 'status', label: 'Durum', required: false },
    { key: 'notes', label: 'Notlar', required: false },
]

export const PROPOSAL_FIELDS = [
    { key: 'title', label: 'Başlık', required: true },
    { key: 'client_id', label: 'Müşteri ID', required: false },
    { key: 'total', label: 'Toplam Tutar', required: true },
    { key: 'valid_until', label: 'Geçerlilik Tarihi', required: false },
    { key: 'notes', label: 'Notlar', required: false },
]

// Auto-mapping suggestions based on common column name patterns
const COLUMN_MAPPINGS: Record<string, string[]> = {
    'code': ['kod', 'code', 'kodu', 'envanter kodu', 'item code', 'id'],
    'type': ['tip', 'type', 'tür', 'türü', 'envanter tipi'],
    'address': ['adres', 'address', 'konum', 'location'],
    'district': ['ilçe', 'ilce', 'district', 'semt'],
    'neighborhood': ['mahalle', 'neighborhood', 'mah'],
    'network': ['network', 'ağ', 'ag', 'network no'],
    'coordinates': ['koordinat', 'coordinates', 'coord', 'koord', 'lat/lng'],
    'width': ['genişlik', 'genislik', 'width', 'en'],
    'height': ['yükseklik', 'yukseklik', 'height', 'boy'],
    'is_active': ['aktif', 'active', 'durum', 'status'],
    'start_date': ['başlangıç', 'baslangic', 'start', 'start_date', 'başlangıç tarihi'],
    'end_date': ['bitiş', 'bitis', 'end', 'end_date', 'bitiş tarihi'],
    'status': ['durum', 'status', 'state'],
    'notes': ['not', 'notes', 'açıklama', 'aciklama', 'description'],
    'title': ['başlık', 'baslik', 'title', 'ad', 'isim'],
    'total': ['toplam', 'total', 'tutar', 'amount', 'fiyat', 'price'],
    'valid_until': ['geçerlilik', 'gecerlilik', 'valid_until', 'expiry', 'son tarih'],
    'client_id': ['müşteri', 'musteri', 'client', 'customer'],
    'project_id': ['proje', 'project'],
    'inventory_item_id': ['envanter', 'inventory', 'item'],
}

/**
 * Parse Excel or CSV file and return structured data
 */
export async function parseFile(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'array' })

                // Get first sheet
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]

                // Convert to JSON with headers
                const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
                    raw: false,
                    defval: ''
                })

                if (jsonData.length === 0) {
                    reject(new Error('Dosya boş veya geçersiz format'))
                    return
                }

                // Extract headers from first row keys
                const headers = Object.keys(jsonData[0])

                resolve({
                    headers,
                    rows: jsonData,
                    fileName: file.name,
                    sheetName
                })
            } catch (error) {
                reject(new Error('Dosya okunamadı: ' + (error as Error).message))
            }
        }

        reader.onerror = () => {
            reject(new Error('Dosya okuma hatası'))
        }

        reader.readAsArrayBuffer(file)
    })
}

/**
 * Auto-suggest column mappings based on header names
 */
export function suggestMappings(
    headers: string[],
    targetFields: { key: string; label: string; required: boolean }[]
): ColumnMapping[] {
    const mappings: ColumnMapping[] = []

    for (const field of targetFields) {
        const possibleNames = COLUMN_MAPPINGS[field.key] || [field.key]

        // Find matching header
        const matchedHeader = headers.find(header => {
            const normalizedHeader = header.toLowerCase().trim()
            return possibleNames.some(name =>
                normalizedHeader.includes(name.toLowerCase()) ||
                name.toLowerCase().includes(normalizedHeader)
            )
        })

        if (matchedHeader) {
            mappings.push({
                sourceColumn: matchedHeader,
                targetField: field.key
            })
        }
    }

    return mappings
}

/**
 * Transform parsed data using column mappings
 */
export function transformData(
    parsedData: ParsedData,
    mappings: ColumnMapping[],
    entityType: 'inventory' | 'booking' | 'proposal'
): Record<string, any>[] {
    return parsedData.rows.map(row => {
        const transformedRow: Record<string, any> = {}

        for (const mapping of mappings) {
            let value = row[mapping.sourceColumn]

            // Type conversions based on target field
            if (mapping.targetField === 'is_active') {
                value = parseBoolean(value)
            } else if (mapping.targetField === 'width' || mapping.targetField === 'height' || mapping.targetField === 'total') {
                value = parseNumber(value)
            } else if (mapping.targetField === 'start_date' || mapping.targetField === 'end_date' || mapping.targetField === 'valid_until') {
                value = parseDate(value)
            } else if (mapping.targetField === 'type') {
                value = normalizeType(value)
            }

            transformedRow[mapping.targetField] = value
        }

        // Add defaults based on entity type
        if (entityType === 'inventory') {
            transformedRow.is_active = transformedRow.is_active ?? true
        } else if (entityType === 'booking') {
            transformedRow.status = transformedRow.status || 'OPTION'
        }

        return transformedRow
    })
}

// Helper functions
function parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim()
        return ['evet', 'yes', 'true', '1', 'aktif', 'active'].includes(lower)
    }
    return Boolean(value)
}

function parseNumber(value: any): number | null {
    if (value === '' || value === null || value === undefined) return null
    const num = parseFloat(String(value).replace(',', '.').replace(/[^\d.-]/g, ''))
    return isNaN(num) ? null : num
}

function parseDate(value: any): string | null {
    if (!value) return null

    // Try parsing various date formats
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
    }

    // Try DD/MM/YYYY or DD.MM.YYYY format
    const parts = String(value).split(/[\/\.\-]/)
    if (parts.length === 3) {
        const [day, month, year] = parts.map(p => parseInt(p))
        if (day && month && year) {
            const parsedDate = new Date(year, month - 1, day)
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString().split('T')[0]
            }
        }
    }

    return null
}

function normalizeType(value: any): string {
    if (!value) return ''
    const upper = String(value).toUpperCase().trim()

    // Map common variations
    if (upper.includes('BILLBOARD') || upper === 'BB') return 'BB'
    if (upper.includes('CLP') || upper.includes('RAKET')) return 'CLP'
    if (upper.includes('GIANT') || upper === 'GB') return 'GB'
    if (upper.includes('MEGA') || upper === 'MGL') return 'MGL'

    return upper
}

/**
 * Validate transformed data before import
 */
export function validateData(
    data: Record<string, any>[],
    fields: { key: string; label: string; required: boolean }[]
): { valid: Record<string, any>[]; errors: { row: number; field: string; message: string }[] } {
    const valid: Record<string, any>[] = []
    const errors: { row: number; field: string; message: string }[] = []

    data.forEach((row, index) => {
        let rowValid = true

        for (const field of fields) {
            if (field.required) {
                const value = row[field.key]
                if (value === undefined || value === null || value === '') {
                    errors.push({
                        row: index + 1,
                        field: field.label,
                        message: `${field.label} alanı zorunludur`
                    })
                    rowValid = false
                }
            }
        }

        if (rowValid) {
            valid.push(row)
        }
    })

    return { valid, errors }
}
