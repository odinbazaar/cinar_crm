const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://slanoowprgrcksfqrgak.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const products = [
    {
        name: 'Billboard',
        code: 'BB',
        description: 'Klasik açıkhava reklam ünitesi',
        dimensions: '350x200 cm',
        material: 'Kağıt / Vinil',
        pricing: [
            { period: 'HAFTALIK', price: 5000, printPrice: 1500 }
        ]
    },
    {
        name: 'CLP (Raket)',
        code: 'CLP',
        description: 'Şehir içi yaya ve araç trafiğine yönelik',
        dimensions: '118.5x175 cm',
        material: 'Kağıt',
        pricing: [
            { period: 'HAFTALIK', price: 2500, printPrice: 500 }
        ]
    },
    {
        name: 'Megalight',
        code: 'MG',
        description: 'Hareketli ve ışıklı dev üniteler',
        dimensions: '320x220 cm',
        material: 'Fibermark & Backlit',
        pricing: [
            { period: 'HAFTALIK', price: 15000, printPrice: 2500 }
        ]
    },
    {
        name: 'Giantboard',
        code: 'GB',
        description: 'Devasa boyutta ve yüksek görünürlük',
        dimensions: '600x300 cm',
        material: 'Vinil',
        pricing: [
            { period: 'AYLIK', price: 45000, printPrice: 5000 }
        ]
    }
];

async function seedPricing() {
    console.log('🌱 Seeding 2025 Price List...\n');

    for (const p of products) {
        // 1. Create Product
        console.log(`Creating/Updating Product: ${p.name}`);
        const { data: product, error: prodError } = await supabase
            .from('products')
            .upsert({
                name: p.name,
                code: p.code,
                description: p.description,
                dimensions: p.dimensions,
                material: p.material,
                updatedAt: new Date()
            }, { onConflict: 'code' })
            .select()
            .single();

        if (prodError) {
            console.error(`❌ Error creating product ${p.name}:`, prodError.message);
            continue;
        }

        // 2. Create Pricing
        for (const pr of p.pricing) {
            const { error: priceError } = await supabase
                .from('price_lists')
                .insert({
                    productId: product.id,
                    name: '2025 Liste Fiyatı',
                    period: pr.period,
                    price: pr.price,
                    printPrice: pr.printPrice,
                    year: 2025,
                    isActive: true
                });

            if (priceError) {
                console.error(`  ❌ Error creating price for ${p.name}:`, priceError.message);
            } else {
                console.log(`  ✅ Added price: ${pr.period} - ${pr.price} TL`);
            }
        }
    }

    console.log('\n✨ Price list seeding completed!');
}

seedPricing()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Fatal:', err);
        process.exit(1);
    });
