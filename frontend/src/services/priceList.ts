
export interface PriceConfig {
    unit: string;
    period: string;
    unitPrice: number;
    opBedel: number;
    baskiFiyati: number;
    baskiAlani: string;
    gorunenAlan: string;
    malzeme: string;
    germePayi?: string;
}

export const PRICE_LIST: Record<string, PriceConfig> = {
    'BB': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 3500,
        opBedel: 400,
        baskiFiyati: 400,
        baskiAlani: '350 x 200 cm',
        gorunenAlan: '340 x 190 cm',
        malzeme: 'Kağıt'
    },
    'CLP': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 1500,
        opBedel: 200,
        baskiFiyati: 200,
        baskiAlani: '118,5 x 175 cm',
        gorunenAlan: '115 x 172 cm',
        malzeme: 'Kağıt'
    },
    'MGL': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 10000,
        opBedel: 500,
        baskiFiyati: 1500,
        baskiAlani: '354 x 247 cm',
        gorunenAlan: '341 x 245 cm',
        malzeme: 'Kağıt'
    },
    'LED': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 8000,
        opBedel: 0,
        baskiFiyati: 0,
        baskiAlani: '1920x1080 px',
        gorunenAlan: '1920x1080 px',
        malzeme: 'Dijital'
    },
    'GB': {
        unit: 'ADET/YÜZ',
        period: '10 GÜN',
        unitPrice: 40000,
        opBedel: 2000,
        baskiFiyati: 4500,
        baskiAlani: '1540 x 245 cm',
        gorunenAlan: '1520 x 220 cm',
        malzeme: 'Blackout Vinil',
        germePayi: 'Her kenardan 10cm'
    },
    'XGB': {
        unit: 'ADET/YÜZ',
        period: '15 GÜN',
        unitPrice: 100000,
        opBedel: 2000,
        baskiFiyati: 7000,
        baskiAlani: '320 x 2200 cm',
        gorunenAlan: '300 x 2000 cm',
        malzeme: 'Blackout Vinil',
        germePayi: 'Her kenardan 10cm'
    },
    'LB': {
        unit: 'ADET/YÜZ',
        period: '1 AY',
        unitPrice: 150000,
        opBedel: 3000,
        baskiFiyati: 4500,
        baskiAlani: '310 x 610 cm',
        gorunenAlan: '300 x 600 cm',
        malzeme: 'Backlit Vinil'
    },
    'MB': {
        unit: 'ADET/YÜZ',
        period: '15 GÜN',
        unitPrice: 35000,
        opBedel: 1500,
        baskiFiyati: 3000,
        baskiAlani: '630 x 310 cm',
        gorunenAlan: '620 x 300 cm',
        malzeme: 'Blackout Vinil',
        germePayi: 'Her kenardan 5cm'
    },
    'DB': {
        unit: 'ADET/CEPHE',
        period: 'AYLIK',
        unitPrice: 0, // Variable
        opBedel: 0,
        baskiFiyati: 0,
        baskiAlani: 'DEĞİŞKENLİK GÖSTEREBİLİR',
        gorunenAlan: 'DEĞİŞKENLİK GÖSTERİR',
        malzeme: 'Mesh Vinil / One Way Vision'
    }
};

export const getPriceForItem = (type: string) => {
    return PRICE_LIST[type] || PRICE_LIST['BB']; // Default to BB if not found
};
