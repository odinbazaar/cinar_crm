import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

// BB (Billboard) inventory items from Excel - Karşıyaka
const bbItems = [
    { code: 'BB0103', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641' },
    { code: 'BB0104', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Kent A.Ş Karşısı', coordinates: '38.49505, 27.11641' },
    { code: 'BB0201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613' },
    { code: 'BB0202', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613' },
    { code: 'BB0203', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613' },
    { code: 'BB0204', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Karşıyaka Tenis Kortları Karşısı', coordinates: '38.49472, 27.11613' },
    { code: 'BB0301', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Park Önü Kavşak', coordinates: '38.4925, 27.09205' },
    { code: 'BB0302', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Park Önü Kavşak', coordinates: '38.4925, 27.09205' },
    { code: 'BB0401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Karşısı', coordinates: '38.49221, 27.09148' },
    { code: 'BB0402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Karşısı', coordinates: '38.49221, 27.09148' },
    { code: 'BB0501', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909' },
    { code: 'BB0502', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909' },
    { code: 'BB0503', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909' },
    { code: 'BB0504', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Coeur de Lion Çevreyolu Çıkışı', coordinates: '38.4909, 27.0909' },
    { code: 'BB0601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191' },
    { code: 'BB0602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191' },
    { code: 'BB0603', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191' },
    { code: 'BB0604', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 1', coordinates: '38.48713, 27.09191' },
    { code: 'BB0605', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191' },
    { code: 'BB0606', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191' },
    { code: 'BB0607', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191' },
    { code: 'BB0608', type: 'BB', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Soyak Siesta Kavşak 2', coordinates: '38.48713, 27.09191' },
    { code: 'BB0701', type: 'BB', district: 'Karşıyaka', neighborhood: 'Cumhuriyet Mahallesi', address: 'Pazar Yeri', coordinates: '38.4828, 27.09677' },
    { code: 'BB0702', type: 'BB', district: 'Karşıyaka', neighborhood: 'Cumhuriyet Mahallesi', address: 'Pazar Yeri', coordinates: '38.4828, 27.09677' },
    { code: 'BB0801', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Diş Hastanesi Önü', coordinates: '38.471, 27.09958' },
    { code: 'BB0802', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Diş Hastanesi Önü', coordinates: '38.471, 27.09958' },
    { code: 'BB0901', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Alt Geçidi Çıkışı', coordinates: '38.465, 27.09666' },
    { code: 'BB1001', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'PTT Önü', coordinates: '38.46105, 27.09613' },
    { code: 'BB1002', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'PTT Önü', coordinates: '38.46105, 27.09613' },
    { code: 'BB1003', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'PTT Önü', coordinates: '38.46105, 27.09613' },
    { code: 'BB1101', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Alt Geçidi', coordinates: '38.46524, 27.09875' },
    { code: 'BB1102', type: 'BB', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü Alt Geçidi', coordinates: '38.46524, 27.09875' },
    { code: 'BB1201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972' },
    { code: 'BB1202', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972' },
    { code: 'BB1203', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972' },
    { code: 'BB1204', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Gode Cengiz Futbol Sahası Önü', coordinates: '38.46113, 27.09972' },
    { code: 'BB1301', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1302', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1303', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1304', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1305', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: '3M Migros Önü', coordinates: '38.45861, 27.09988' },
    { code: 'BB1401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Evrensel Çocuk Müzesi Önü', coordinates: '38.47475, 27.08333' },
    { code: 'BB1402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Evrensel Çocuk Müzesi Önü', coordinates: '38.47475, 27.08333' },
    { code: 'BB1501', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1502', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1503', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1504', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1505', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1506', type: 'BB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Pazar Yeri Önü', coordinates: '38.45897, 27.08947' },
    { code: 'BB1601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1603', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1604', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1605', type: 'BB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol', coordinates: '38.46622, 27.08827' },
    { code: 'BB1701', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025' },
    { code: 'BB1702', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025' },
    { code: 'BB1703', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025' },
    { code: 'BB1704', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Önü', coordinates: '38.47725, 27.07025' },
    { code: 'BB1801', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Karşısı', coordinates: '38.47711, 27.07055' },
    { code: 'BB1802', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Atılgan Suit Karşısı', coordinates: '38.47711, 27.07055' },
    { code: 'BB1901', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923' },
    { code: 'BB1902', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923' },
    { code: 'BB1903', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923' },
    { code: 'BB1904', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Flamingo Caddesi Hilltown Girişi', coordinates: '38.47633, 27.06923' },
    { code: 'BB2001', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661' },
    { code: 'BB2002', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661' },
    { code: 'BB2003', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661' },
    { code: 'BB2004', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Modern 4 Kavşak', coordinates: '38.47796, 27.08661' },
    { code: 'BB2101', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805' },
    { code: 'BB2102', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805' },
    { code: 'BB2103', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805' },
    { code: 'BB2104', type: 'BB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Sports International Önü', coordinates: '38.46786, 27.0805' },
    { code: 'BB2201', type: 'BB', district: 'Karşıyaka', neighborhood: 'Girne', address: 'Atatürk Bulvarı Vatan Bilgisayar Yanı', coordinates: '38.46269, 27.10969' },
    { code: 'BB2301', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522' },
    { code: 'BB2302', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522' },
    { code: 'BB2303', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522' },
    { code: 'BB2304', type: 'BB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'Yeni Girne Çevreyolu Kavşağı', coordinates: '38.49066, 27.11522' },
    { code: 'BB2401', type: 'BB', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Saklıbahçe Karakol Yanı', coordinates: '38.48194, 27.11319' },
    { code: 'BB2402', type: 'BB', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Saklıbahçe Karakol Yanı', coordinates: '38.48194, 27.11319' },
    { code: 'BB2501', type: 'BB', district: 'Karşıyaka', neighborhood: 'Şemikler', address: '15 Temmuz Şehitler Anadolu Lisesi', coordinates: '38.48316, 27.08644' },
    { code: 'BB2601', type: 'BB', district: 'Karşıyaka', neighborhood: 'Girne', address: 'Kültürpark Önü', coordinates: '38.46216, 27.10822' },
    { code: 'BB2602', type: 'BB', district: 'Karşıyaka', neighborhood: 'Girne', address: 'Kültürpark Önü', coordinates: '38.46216, 27.10822' },
];

// CLP (City Light Poster) inventory items from Excel - Karşıyaka
const clpItems = [
    { code: 'CLP0101', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Yamaç Mah Soyak Siesta Carrefour', coordinates: '38.48647, 27.08905' },
    { code: 'CLP0102', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Esin Sitesi', address: 'Yamaç Mah Soyak Siesta Carrefour', coordinates: '38.48647, 27.08905' },
    { code: 'CLP0201', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Züftü Işıl Spor Salonu Önü', coordinates: '38.49502, 27.11258' },
    { code: 'CLP0202', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Örnekköy', address: 'Züftü Işıl Spor Salonu Önü', coordinates: '38.49502, 27.11258' },
    { code: 'CLP0301', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Hat Boyu Demirköprü Alt Geçit', coordinates: '38.46541, 27.09855' },
    { code: 'CLP0302', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Hat Boyu Demirköprü Alt Geçit', coordinates: '38.46541, 27.09855' },
    { code: 'CLP0401', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Cengiz Topel Parkı-1', coordinates: '38.45927, 27.09494' },
    { code: 'CLP0402', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Cengiz Topel Parkı-1', coordinates: '38.45927, 27.09494' },
    { code: 'CLP0501', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Cengiz Topel Parkı-2', coordinates: '38.45883, 27.09483' },
    { code: 'CLP0502', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Cengiz Topel Parkı-2', coordinates: '38.45883, 27.09483' },
    { code: 'CLP0601', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Efes Sitesi Restoran Önü-1', coordinates: '38.46794, 27.08583' },
    { code: 'CLP0602', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Efes Sitesi Restoran Önü-1', coordinates: '38.46794, 27.08583' },
    { code: 'CLP0701', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Efes Sitesi Restoran Önü-2', coordinates: '38.46786, 27.08613' },
    { code: 'CLP0702', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Efes Sitesi Restoran Önü-2', coordinates: '38.46786, 27.08613' },
    { code: 'CLP0801', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Alaybey', address: 'Naldöken İzban Yanı-1', coordinates: '38.46488, 27.1293' },
    { code: 'CLP0802', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Alaybey', address: 'Naldöken İzban Yanı-1', coordinates: '38.46488, 27.1293' },
    { code: 'CLP0901', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Alaybey', address: 'Naldöken İzban Yanı-2', coordinates: '38.46497, 27.12902' },
    { code: 'CLP0902', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Alaybey', address: 'Naldöken İzban Yanı-2', coordinates: '38.46497, 27.12902' },
    { code: 'CLP1001', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İzban Önü', coordinates: '38.45819, 27.11525' },
    { code: 'CLP1002', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İzban Önü', coordinates: '38.45819, 27.11525' },
    { code: 'CLP1101', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavibahçe Avm Önü', coordinates: '38.47402, 27.07402' },
    { code: 'CLP1102', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavibahçe Avm Önü', coordinates: '38.47402, 27.07402' },
    { code: 'CLP1201', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Başkent Üniversite Önü-1', coordinates: '38.47125, 27.08591' },
    { code: 'CLP1202', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Başkent Üniversite Önü-1', coordinates: '38.47125, 27.08591' },
    { code: 'CLP1301', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Başkent Üniversite Önü-2', coordinates: '38.47116, 27.08563' },
    { code: 'CLP1302', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Başkent Üniversite Önü-2', coordinates: '38.47116, 27.08563' },
    { code: 'CLP1401', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Dinazor Park Önü', coordinates: '38.47486, 27.08349' },
    { code: 'CLP1402', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Dinazor Park Önü', coordinates: '38.47486, 27.08349' },
    { code: 'CLP1501', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: '3M Migros Önü', coordinates: '38.47466, 27.08397' },
    { code: 'CLP1502', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Atakent', address: '3M Migros Önü', coordinates: '38.47466, 27.08397' },
    { code: 'CLP1601', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü İzban Çıkışı', coordinates: '38.46763, 27.09661' },
    { code: 'CLP1602', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Demirköprü', address: 'Demirköprü İzban Çıkışı', coordinates: '38.46763, 27.09661' },
    { code: 'CLP1701', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İzban Girişi-Sol', coordinates: '38.45772, 27.11577' },
    { code: 'CLP1702', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İzban Girişi-Sol', coordinates: '38.45772, 27.11577' },
    { code: 'CLP1801', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İzban Girişi-Sağ', coordinates: '38.45772, 27.11577' },
    { code: 'CLP1802', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İzban Girişi-Sağ', coordinates: '38.45772, 27.11577' },
    { code: 'CLP1901', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı Akbank Önü-Sol', coordinates: '38.45705, 27.11702' },
    { code: 'CLP1902', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı Akbank Önü-Sol', coordinates: '38.45705, 27.11702' },
    { code: 'CLP2001', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı Akbank Önü-Sağ', coordinates: '38.45705, 27.11702' },
    { code: 'CLP2002', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı Akbank Önü-Sağ', coordinates: '38.45705, 27.11702' },
    { code: 'CLP2101', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İskele Girişi-Sol', coordinates: '38.45705, 27.11702' },
    { code: 'CLP2202', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İskele Girişi-Sol', coordinates: '38.45535, 27.11972' },
    { code: 'CLP2301', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İskele Girişi-Sağ', coordinates: '38.45535, 27.11972' },
    { code: 'CLP2302', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Merkez', address: 'Karşıyaka Çarşı İskele Girişi-Sağ', coordinates: '38.45535, 27.11972' },
    { code: 'CLP2401', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Waffle Akın Karşısı', coordinates: '38.4558, 27.09927' },
    { code: 'CLP2402', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Waffle Akın Karşısı', coordinates: '38.4558, 27.09927' },
    { code: 'CLP2501', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Barlar Sokağı Girişi', coordinates: '38.45755, 27.09755' },
    { code: 'CLP2502', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Barlar Sokağı Girişi', coordinates: '38.45755, 27.09755' },
    { code: 'CLP2601', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Barlar Sokağı Girişi', coordinates: '38.45755, 27.09755' },
    { code: 'CLP2602', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Barlar Sokağı Girişi', coordinates: '38.45755, 27.09755' },
    { code: 'CLP2701', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Barlar Sokağı', coordinates: '38.45719, 27.09702' },
    { code: 'CLP2702', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Barlar Sokağı', coordinates: '38.45719, 27.09702' },
    { code: 'CLP2801', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Garanti Bankası Önü', coordinates: '38.45805, 27.09616' },
    { code: 'CLP2802', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Garanti Bankası Önü', coordinates: '38.45805, 27.09616' },
    { code: 'CLP2901', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Bravo Kavşak Sol', coordinates: '38.4585, 27.09502' },
    { code: 'CLP2902', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Bravo Kavşak Sol', coordinates: '38.4585, 27.09502' },
    { code: 'CLP3001', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Bravo Kavşak Sağ', coordinates: '38.45842, 27.0951' },
    { code: 'CLP3002', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Bravo Kavşak Sağ', coordinates: '38.45842, 27.0951' },
    { code: 'CLP3101', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri İş Bankası Önü', coordinates: '38.45897, 27.0935' },
    { code: 'CLP3102', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri İş Bankası Önü', coordinates: '38.45897, 27.0935' },
    { code: 'CLP3201', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri Halkbank Önü', coordinates: '38.45879, 27.09347' },
    { code: 'CLP3202', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri Halkbank Önü', coordinates: '38.45879, 27.09347' },
    { code: 'CLP3301', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri Boğaziçi Karşısı', coordinates: '38.46013, 27.0905' },
    { code: 'CLP3302', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri Boğaziçi Karşısı', coordinates: '38.46013, 27.0905' },
    { code: 'CLP3401', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri Boğaziçi Önü', coordinates: '38.46041, 27.09069' },
    { code: 'CLP3402', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evleri Boğaziçi Önü', coordinates: '38.46041, 27.09069' },
    { code: 'CLP3501', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Şemikler', address: 'Şemikler / İzban Çıkışı', coordinates: '38.4745, 27.08991' },
    { code: 'CLP3502', type: 'CLP', district: 'Karşıyaka', neighborhood: 'Şemikler', address: 'Şemikler / İzban Çıkışı', coordinates: '38.4745, 27.08991' },
];

// GB (Glass Board) inventory items from Excel - Karşıyaka
const gbItems = [
    { code: 'GB01', type: 'GB', district: 'Karşıyaka', neighborhood: 'Alaybey', address: 'Karşıyaka Altınyol Çıkışı', coordinates: '38.46497, 27.12922' },
    { code: 'GB02', type: 'GB', district: 'Karşıyaka', neighborhood: 'Yeni Girne', address: 'MedicalPoint Girişi Sağ', coordinates: '38.4735, 27.11305' },
    { code: 'GB03', type: 'GB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Denizkent Restoran Girişi', coordinates: '38.46963, 27.07547' },
    { code: 'GB04', type: 'GB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavişehir Ottoman Önü', coordinates: '38.47697, 27.08722' },
    { code: 'GB05', type: 'GB', district: 'Karşıyaka', neighborhood: 'Mavişehir', address: 'Mavişehir Doğa Koleji Önü', coordinates: '38.47548, 27.08459' },
    { code: 'GB06', type: 'GB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı 3M Migros Şehitler Bulvarı', coordinates: '38.46102, 27.10286' },
    { code: 'GB07', type: 'GB', district: 'Karşıyaka', neighborhood: 'Atakent', address: 'Hasan Türker Futbol Sahası AVMler Kavşağı', coordinates: '38.46625, 27.08813' },
    { code: 'GB08', type: 'GB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Suat Taşer Tiyatro Girişi', coordinates: '38.45469, 27.09988' },
    { code: 'GB09', type: 'GB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Sahil Girişi', coordinates: '38.45372, 27.10033' },
    { code: 'GB10', type: 'GB', district: 'Karşıyaka', neighborhood: 'Bostanlı', address: 'Bostanlı Vilayet Evler Karşısı', coordinates: '38.46002, 27.09044' },
];

async function seedKarsiyakaInventory() {
    console.log('📦 Seeding Karşıyaka inventory...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Missing environment variables');
        return;
    }

    const allItems = [
        ...bbItems.map(item => ({ ...item, network: 'Karşıyaka', is_active: true })),
        ...clpItems.map(item => ({ ...item, network: 'Karşıyaka', is_active: true })),
        ...gbItems.map(item => ({ ...item, network: 'Karşıyaka', is_active: true })),
    ];

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    try {
        for (const item of allItems) {
            const { data: existing } = await supabase
                .from('inventory_items')
                .select('id')
                .eq('code', item.code)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('inventory_items')
                    .insert(item);

                if (error) {
                    console.error(`❌ Failed to insert ${item.code}:`, error.message);
                    errors++;
                } else {
                    console.log(`✅ Inserted ${item.code} (${item.type})`);
                    inserted++;
                }
            } else {
                console.log(`⚠️  ${item.code} already exists, skipping.`);
                skipped++;
            }
        }

        console.log('\n✨ Karşıyaka inventory seeding completed!');
        console.log(`   📊 Total items: ${allItems.length}`);
        console.log(`   ✅ Inserted: ${inserted}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedKarsiyakaInventory();
