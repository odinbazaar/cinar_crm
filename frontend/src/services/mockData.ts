import { addDays, format } from 'date-fns'

// Types
export type InventoryType = 'BB' | 'CLP' | 'GB' | 'MGL' | 'LED' | 'XGB' | 'LB' | 'MB' | 'DB'

export interface InventoryItem {
    id: string
    code: string
    type: InventoryType
    district: string
    neighborhood: string
    address: string
    coordinates: string
    network?: string
    status: 'ACTIVE' | 'MAINTENANCE'
}

export interface Booking {
    id: string
    inventoryItemId: string
    inventoryItem?: InventoryItem
    clientName: string
    startDate: string
    endDate: string
    status: 'OPTION' | 'CONFIRMED' | 'CANCELLED'
    network?: string
    notes?: string
}

// Mock Data from Excel Screenshots (KODLAR Sheet Matrix)
export const mockInventory: InventoryItem[] = [
    // --- BB01: Kent A.Ş Karşısı ---
    { id: 'bb-0101', code: 'BB0101', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641', network: '1', status: 'ACTIVE' },
    { id: 'bb-0102', code: 'BB0102', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641', network: '1', status: 'ACTIVE' },
    { id: 'bb-0103', code: 'BB0103', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641', network: '3', status: 'ACTIVE' },
    { id: 'bb-0104', code: 'BB0104', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641', network: '3', status: 'ACTIVE' },

    // --- BB02: Karşıyaka Tenis Kortları Karşısı ---
    { id: 'bb-0201', code: 'BB0201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613', network: '1', status: 'ACTIVE' },
    { id: 'bb-0202', code: 'BB0202', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613', network: '1', status: 'ACTIVE' },
    { id: 'bb-0203', code: 'BB0203', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613', network: '2', status: 'ACTIVE' },
    { id: 'bb-0204', code: 'BB0204', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613', network: '2', status: 'ACTIVE' },

    // --- BB03: Park Önü Kavşak ---
    { id: 'bb-0301', code: 'BB0301', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Park Önü Kavşak', coordinates: '38.4925, 27.09205', network: '1', status: 'ACTIVE' },
    { id: 'bb-0302', code: 'BB0302', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Park Önü Kavşak', coordinates: '38.4925, 27.09205', network: '1', status: 'ACTIVE' },

    // --- BB04: Coeur de Lion Karşısı ---
    { id: 'bb-0401', code: 'BB0401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Karşısı', coordinates: '38.49221, 27.09148', network: '1', status: 'ACTIVE' },
    { id: 'bb-0402', code: 'BB0402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Karşısı', coordinates: '38.49221, 27.09148', network: '1', status: 'ACTIVE' },

    // --- BB05: Coeur de Lion Çevreyolu Çıkışı ---
    { id: 'bb-0501', code: 'BB0501', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909', network: '3', status: 'ACTIVE' },
    { id: 'bb-0502', code: 'BB0502', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909', network: '3', status: 'ACTIVE' },
    { id: 'bb-0503', code: 'BB0503', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909', network: '2', status: 'ACTIVE' },
    { id: 'bb-0504', code: 'BB0504', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909', network: '2', status: 'ACTIVE' },

    // --- BB06: Soyak Siesta Kavşak 1 & 2 ---
    { id: 'bb-0601', code: 'BB0601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191', network: '2', status: 'ACTIVE' },
    { id: 'bb-0602', code: 'BB0602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191', network: '2', status: 'ACTIVE' },
    { id: 'bb-0603', code: 'BB0603', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-0604', code: 'BB0604', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-0605', code: 'BB0605', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191', network: '1', status: 'ACTIVE' },
    { id: 'bb-0606', code: 'BB0606', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191', network: '1', status: 'ACTIVE' },
    { id: 'bb-0607', code: 'BB0607', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-0608', code: 'BB0608', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB07: Pazar Yeri ---
    { id: 'bb-0701', code: 'BB0701', type: 'BB', district: 'Karşıyaka', neighborhood: 'Cumhuriyet', address: 'Pazar Yeri', coordinates: '38.4828, 27.09677', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-0702', code: 'BB0702', type: 'BB', district: 'Karşıyaka', neighborhood: 'Cumhuriyet', address: 'Pazar Yeri', coordinates: '38.4828, 27.09677', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB08: Demirköprü Diş Hastanesi Önü ---
    { id: 'bb-0801', code: 'BB0801', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Diş Hastanesi Önü', coordinates: '38.471, 27.09958', network: '2', status: 'ACTIVE' },
    { id: 'bb-0802', code: 'BB0802', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Diş Hastanesi Önü', coordinates: '38.471, 27.09958', network: '2', status: 'ACTIVE' },

    // --- BB09: Demirköprü Alt Geçidi Çıkışı ---
    { id: 'bb-0901', code: 'BB0901', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Alt Geçidi Çıkışı', coordinates: '38.465, 27.09666', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB10: PTT Önü ---
    { id: 'bb-1001', code: 'BB1001', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'PTT Önü', coordinates: '38.46105, 27.09613', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1002', code: 'BB1002', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'PTT Önü', coordinates: '38.46105, 27.09613', network: '1', status: 'ACTIVE' },
    { id: 'bb-1003', code: 'BB1003', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'PTT Önü', coordinates: '38.46105, 27.09613', network: '1', status: 'ACTIVE' },

    // --- BB11: Demirköprü Alt Geçidi ---
    { id: 'bb-1101', code: 'BB1101', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Alt Geçidi', coordinates: '38.46524, 27.09875', network: '2', status: 'ACTIVE' },
    { id: 'bb-1102', code: 'BB1102', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Alt Geçidi', coordinates: '38.46524, 27.09875', network: '2', status: 'ACTIVE' },

    // --- BB12: Gode Cengiz Futbol Sahası Önü ---
    { id: 'bb-1201', code: 'BB1201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972', network: '3', status: 'ACTIVE' },
    { id: 'bb-1202', code: 'BB1202', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972', network: '3', status: 'ACTIVE' },
    { id: 'bb-1203', code: 'BB1203', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1204', code: 'BB1204', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB13: 3M Migros Önü ---
    { id: 'bb-1301', code: 'BB1301', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1302', code: 'BB1302', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988', network: '1', status: 'ACTIVE' },
    { id: 'bb-1303', code: 'BB1303', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988', network: '1', status: 'ACTIVE' },
    { id: 'bb-1304', code: 'BB1304', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988', network: '3', status: 'ACTIVE' },
    { id: 'bb-1305', code: 'BB1305', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988', network: '3', status: 'ACTIVE' },

    // --- BB14: Evrensel Çocuk Müzesi Önü ---
    { id: 'bb-1401', code: 'BB1401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Evrensel Çocuk Müzesi Önü', coordinates: '38.47475, 27.08333', network: '2', status: 'ACTIVE' },
    { id: 'bb-1402', code: 'BB1402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Evrensel Çocuk Müzesi Önü', coordinates: '38.47475, 27.08333', network: '2', status: 'ACTIVE' },

    // --- BB15: Pazar Yeri Önü ---
    { id: 'bb-1501', code: 'BB1501', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947', network: '1', status: 'ACTIVE' },
    { id: 'bb-1502', code: 'BB1502', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947', network: '1', status: 'ACTIVE' },
    { id: 'bb-1503', code: 'BB1503', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947', network: '3', status: 'ACTIVE' },
    { id: 'bb-1504', code: 'BB1504', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947', network: '3', status: 'ACTIVE' },
    { id: 'bb-1505', code: 'BB1505', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1506', code: 'BB1506', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB16: Hasan Türker Futbol ---
    { id: 'bb-1601', code: 'BB1601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1602', code: 'BB1602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827', network: '2', status: 'ACTIVE' },
    { id: 'bb-1603', code: 'BB1603', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827', network: '2', status: 'ACTIVE' },
    { id: 'bb-1604', code: 'BB1604', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827', network: '3', status: 'ACTIVE' },
    { id: 'bb-1605', code: 'BB1605', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827', network: '3', status: 'ACTIVE' },

    // --- BB17: Atılgan Suit Önü ---
    { id: 'bb-1701', code: 'BB1701', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025', network: '1', status: 'ACTIVE' },
    { id: 'bb-1702', code: 'BB1702', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025', network: '1', status: 'ACTIVE' },
    { id: 'bb-1703', code: 'BB1703', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1704', code: 'BB1704', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB18: Atılgan Suit Karşısı ---
    { id: 'bb-1801', code: 'BB1801', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Karşısı', coordinates: '38.47711, 27.07055', network: 'BELEDİYE', status: 'ACTIVE' },
    { id: 'bb-1802', code: 'BB1802', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Karşısı', coordinates: '38.47711, 27.07055', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB19: Flamingo Caddesi Hilltown Girişi ---
    { id: 'bb-1901', code: 'BB1901', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923', network: '1', status: 'ACTIVE' },
    { id: 'bb-1902', code: 'BB1902', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923', network: '1', status: 'ACTIVE' },
    { id: 'bb-1903', code: 'BB1903', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923', network: '3', status: 'ACTIVE' },
    { id: 'bb-1904', code: 'BB1904', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923', network: '3', status: 'ACTIVE' },

    // --- BB20: Modern 4 Kavşak ---
    { id: 'bb-2001', code: 'BB2001', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661', network: '2', status: 'ACTIVE' },
    { id: 'bb-2002', code: 'BB2002', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661', network: '2', status: 'ACTIVE' },
    { id: 'bb-2003', code: 'BB2003', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661', network: '3', status: 'ACTIVE' },
    { id: 'bb-2004', code: 'BB2004', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661', network: '3', status: 'ACTIVE' },

    // --- BB21: Sports International Önü ---
    { id: 'bb-2101', code: 'BB2101', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805', network: '1', status: 'ACTIVE' },
    { id: 'bb-2102', code: 'BB2102', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805', network: '1', status: 'ACTIVE' },
    { id: 'bb-2103', code: 'BB2103', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805', network: '3', status: 'ACTIVE' },
    { id: 'bb-2104', code: 'BB2104', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805', network: '3', status: 'ACTIVE' },

    // --- BB22: Atatürk Bulvarı Vatan Bilgisayar Yanı ---
    { id: 'bb-2201', code: 'BB2201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Girne', address: 'Atatürk Bulvarı Vatan Bilgisayar Yanı', coordinates: '38.46269, 27.10969', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB23: Yeni Girne Çevreyolu Kavşağı ---
    { id: 'bb-2301', code: 'BB2301', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522', network: '2', status: 'ACTIVE' },
    { id: 'bb-2302', code: 'BB2302', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522', network: '2', status: 'ACTIVE' },
    { id: 'bb-2303', code: 'BB2303', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522', network: '3', status: 'ACTIVE' },
    { id: 'bb-2304', code: 'BB2304', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522', network: '3', status: 'ACTIVE' },

    // --- BB24: Saklıbahçe Karakol Yanı ---
    { id: 'bb-2401', code: 'BB2401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Saklıbahçe Karakol Yanı', coordinates: '38.48194, 27.11319', network: '1', status: 'ACTIVE' },
    { id: 'bb-2402', code: 'BB2402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Saklıbahçe Karakol Yanı', coordinates: '38.48194, 27.11319', network: '1', status: 'ACTIVE' },

    // --- BB25: 15 Temmuz Şehitler Anadolu Lisesi ---
    { id: 'bb-2501', code: 'BB2501', type: 'BB', district: 'Karşıyaka', neighborhood: 'Şemikler', address: '15 Temmuz Şehitler Anadolu Lisesi', coordinates: '38.48316, 27.08644', network: 'BELEDİYE', status: 'ACTIVE' },

    // --- BB26: Kültürpark Önü ---
    { id: 'bb-2601', code: 'BB2601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Çiğli', address: 'Kültürpark Önü', coordinates: '38.46216, 27.10822', network: '2', status: 'ACTIVE' },
    { id: 'bb-2602', code: 'BB2602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Çiğli', address: 'Kültürpark Önü', coordinates: '38.46216, 27.10822', network: '2', status: 'ACTIVE' },

    // --- OTHER TYPES (Existing) ---
    { id: 'clp-0101', code: 'CLP0101', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Yamaç Mah Soyak Siesta Carrefour', coordinates: '38.48647, 27.08905', status: 'ACTIVE' },
    { id: 'clp-0201', code: 'CLP0201', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Zühtü Işıl Spor Salonu Önü', coordinates: '38.49502, 27.11258', status: 'ACTIVE' },
    { id: 'gb-01', code: 'GB01', type: 'GB', district: 'Karşıyaka', neighborhood: 'Alaybey', address: 'Karşıyaka Altınyol Çıkışı', coordinates: '38.46497, 27.12922', status: 'ACTIVE' },
    { id: 'mgl-0101', code: 'MGL0101', type: 'MGL', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Bahriye Üçok Bulvarı Karşıyaka Belediyesi Önü', coordinates: '38.45968, 27.11424', status: 'ACTIVE' },
    // --- NEW TYPES FROM PRICE LIST ---
    { id: 'led-01', code: 'LED01', type: 'LED', district: 'İzmir', neighborhood: 'Alsancak', address: 'Kordon Girişi', coordinates: '38.4357, 27.1384', status: 'ACTIVE' },
    { id: 'xgb-01', code: 'XGB01', type: 'XGB', district: 'İzmir', neighborhood: 'Bayraklı', address: 'Folkart Towers Yanı', coordinates: '38.4533, 27.1733', status: 'ACTIVE' },
    { id: 'lb-01', code: 'LB01', type: 'LB', district: 'İzmir', neighborhood: 'Konak', address: 'Saat Kulesi Meydanı', coordinates: '38.4189, 27.1287', status: 'ACTIVE' },
    { id: 'mb-01', code: 'MB01', type: 'MB', district: 'İzmir', neighborhood: 'Bornova', address: 'Ege Üniversitesi Girişi', coordinates: '38.4571, 27.2131', status: 'ACTIVE' },
    { id: 'db-01', code: 'DB01', type: 'DB', district: 'İzmir', neighborhood: 'Karşıyaka', address: 'Bina Cephe Reklam Alanı', coordinates: '38.4600, 27.1100', status: 'ACTIVE' },
]

// Generate bookings for Network 1 items based on screenshot
const network1Items = mockInventory.filter(i => i.network === '1')
const network1Bookings: Booking[] = network1Items.map(item => ({
    id: `bk-${item.id}`,
    inventoryItemId: item.id,
    clientName: 'RADİKAL EĞİTİM',
    startDate: '2025-12-22',
    endDate: '2025-12-29',
    status: 'OPTION',
    network: '1',
    notes: 'Opsiyonlar: SİNTAÇ, ÇAKABEY KOLEJİ, ÇAMKIRAN OTOMOTİV'
}))

export const mockBookings: Booking[] = [
    ...network1Bookings,
    // Existing bookings
    { id: '101', inventoryItemId: 'clp-0101', clientName: 'SUSHITTO', startDate: '2025-11-17', endDate: '2025-11-24', status: 'CONFIRMED', network: '2' },
    { id: '104', inventoryItemId: 'mgl-0101', clientName: 'KARŞIYAKA BEL', startDate: '2025-11-17', endDate: '2025-11-24', status: 'CONFIRMED', network: '1' },
]

export const getInventoryStats = () => {
    const total = mockInventory.length
    const active = mockInventory.filter(i => i.status === 'ACTIVE').length
    const booked = new Set(mockBookings.map(b => b.inventoryItemId)).size
    const occupancy = Math.round((booked / total) * 100)

    return { total, active, booked, occupancy }
}
