
export interface PriceConfig {
    unit: string;
    period: string;
    unitPrice: number;
    discountedPrice: number;
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
        unitPrice: 6500,
        discountedPrice: 4250,
        opBedel: 500,
        baskiFiyati: 400,
        baskiAlani: '350 x 200 cm',
        gorunenAlan: '340 x 190 cm',
        malzeme: 'Kağıt'
    },
    'CLP': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 3000,
        discountedPrice: 2000,
        opBedel: 250,
        baskiFiyati: 300,
        baskiAlani: '118,5 x 175 cm',
        gorunenAlan: '115 x 172 cm',
        malzeme: 'Kağıt'
    },
    'MGL': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 12000,
        discountedPrice: 7500,
        opBedel: 1200,
        baskiFiyati: 1750,
        baskiAlani: '354 x 247 cm',
        gorunenAlan: '341 x 245 cm',
        malzeme: 'Kağıt'
    },
    'LB': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 15000,
        discountedPrice: 9000,
        opBedel: 0,
        baskiFiyati: 0,
        baskiAlani: '1920x1080 px',
        gorunenAlan: '1920x1080 px',
        malzeme: 'Dijital'
    },
    'LED': {
        unit: 'ADET/YÜZ',
        period: 'HAFTALIK',
        unitPrice: 15000,
        discountedPrice: 9000,
        opBedel: 0,
        baskiFiyati: 0,
        baskiAlani: '1920x1080 px',
        gorunenAlan: '1920x1080 px',
        malzeme: 'Dijital'
    },
    'GB': {
        unit: 'ADET/YÜZ',
        period: '10 GÜN',
        unitPrice: 85000,
        discountedPrice: 55000,
        opBedel: 2500,
        baskiFiyati: 4500,
        baskiAlani: '1540 x 245 cm',
        gorunenAlan: '1520 x 220 cm',
        malzeme: 'Blackout Vinil',
        germePayi: 'Her kenardan 10cm'
    },
    'KB': {
        unit: 'ADET/YÜZ',
        period: '1 AY',
        unitPrice: 250000,
        discountedPrice: 180000,
        opBedel: 15000,
        baskiFiyati: 9600,
        baskiAlani: '310 x 610 cm',
        gorunenAlan: '300 x 600 cm',
        malzeme: 'Backlit Vinil'
    },
    'MB': {
        unit: 'ADET/YÜZ',
        period: '1 AY',
        unitPrice: 175000,
        discountedPrice: 100000,
        opBedel: 1500,
        baskiFiyati: 3500,
        baskiAlani: '630 x 310 cm',
        gorunenAlan: '620 x 300 cm',
        malzeme: 'Blackout Vinil',
        germePayi: 'Her kenardan 5cm'
    }
};

export const getPriceForItem = (type: string) => {
    return PRICE_LIST[type] || PRICE_LIST['BB']; // Default to BB if not found
};
