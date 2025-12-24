-- =====================================================
-- HIZLI KURULUM - Customer Requests Tablosu
-- Supabase SQL Editor'da bu dosyayı çalıştırın
-- =====================================================

-- Tabloyu oluştur (basit versiyon, constraint'sız)
CREATE TABLE IF NOT EXISTS customer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL DEFAULT 'billboard',
    product_details TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    preferred_districts TEXT[],
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    notes TEXT,
    assigned_to UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS'yi devre dışı bırak (geliştirme aşaması için)
ALTER TABLE customer_requests DISABLE ROW LEVEL SECURITY;

-- Test verisi ekle
INSERT INTO customer_requests (request_number, client_id, product_type, quantity, start_date, end_date, status, priority, notes)
SELECT 
    'TLP-241208-0001',
    id,
    'billboard',
    10,
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '37 days',
    'pending',
    'high',
    'Test talebi'
FROM clients
LIMIT 1
ON CONFLICT (request_number) DO NOTHING;

SELECT 'customer_requests tablosu oluşturuldu!' as result;
