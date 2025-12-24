-- =====================================================
-- SUPABASE SETUP - Tüm Yeni Tablolar ve RLS Politikaları
-- =====================================================

-- =====================================================
-- 1. CUSTOMER_REQUESTS TABLOSU (Müşteri Talep Formu)
-- =====================================================

-- Önce varsa constraint'leri kaldır
ALTER TABLE IF EXISTS customer_requests DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE IF EXISTS customer_requests DROP CONSTRAINT IF EXISTS check_priority;
ALTER TABLE IF EXISTS customer_requests DROP CONSTRAINT IF EXISTS check_product_type;

-- Tabloyu oluştur
CREATE TABLE IF NOT EXISTS customer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_customer_requests_client_id ON customer_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_requests_status ON customer_requests(status);
CREATE INDEX IF NOT EXISTS idx_customer_requests_priority ON customer_requests(priority);
CREATE INDEX IF NOT EXISTS idx_customer_requests_product_type ON customer_requests(product_type);
CREATE INDEX IF NOT EXISTS idx_customer_requests_dates ON customer_requests(start_date, end_date);

-- Constraint'ler
ALTER TABLE customer_requests ADD CONSTRAINT check_status 
    CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE customer_requests ADD CONSTRAINT check_priority 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE customer_requests ADD CONSTRAINT check_product_type 
    CHECK (product_type IN ('billboard', 'megalight', 'digital_screen', 'bus_shelter', 'bridge_banner', 'raket', 'giant_board', 'other'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_customer_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customer_requests_updated_at ON customer_requests;
CREATE TRIGGER customer_requests_updated_at
    BEFORE UPDATE ON customer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_requests_updated_at();

-- RLS
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON customer_requests;
CREATE POLICY "Allow all for authenticated users" ON customer_requests
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anonim kullanıcılar için okuma izni (eğer gerekirse)
DROP POLICY IF EXISTS "Allow read for anon" ON customer_requests;
CREATE POLICY "Allow read for anon" ON customer_requests
    FOR SELECT
    TO anon
    USING (true);

-- Service role için tam erişim
DROP POLICY IF EXISTS "Allow all for service role" ON customer_requests;
CREATE POLICY "Allow all for service role" ON customer_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 2. MOUNTING_SCHEDULES TABLOSU (Asım Listesi)
-- =====================================================

CREATE TABLE IF NOT EXISTS mounting_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    month_number INTEGER NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    brand_option_1 VARCHAR(100),
    brand_option_1_qty INTEGER DEFAULT 0,
    brand_option_2 VARCHAR(100),
    brand_option_2_qty INTEGER DEFAULT 0,
    brand_option_3 VARCHAR(100),
    brand_option_3_qty INTEGER DEFAULT 0,
    brand_option_4 VARCHAR(100),
    brand_option_4_qty INTEGER DEFAULT 0,
    network VARCHAR(50),
    network_qty INTEGER DEFAULT 0,
    total_qty INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_mounting_schedules_year ON mounting_schedules(year);
CREATE INDEX IF NOT EXISTS idx_mounting_schedules_month ON mounting_schedules(month_number);
CREATE INDEX IF NOT EXISTS idx_mounting_schedules_client ON mounting_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_mounting_schedules_dates ON mounting_schedules(week_start, week_end);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_mounting_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mounting_schedules_updated_at ON mounting_schedules;
CREATE TRIGGER mounting_schedules_updated_at
    BEFORE UPDATE ON mounting_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_mounting_schedules_updated_at();

-- RLS
ALTER TABLE mounting_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON mounting_schedules;
CREATE POLICY "Allow all for authenticated users" ON mounting_schedules
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read for anon" ON mounting_schedules;
CREATE POLICY "Allow read for anon" ON mounting_schedules
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow all for service role" ON mounting_schedules;
CREATE POLICY "Allow all for service role" ON mounting_schedules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 3. MEVCUT TABLOLARA RLS POLİTİKALARI EKLE
-- =====================================================

-- CLIENTS tablosu
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON clients;
CREATE POLICY "Allow all for authenticated users" ON clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read for anon" ON clients;
CREATE POLICY "Allow read for anon" ON clients
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow all for service role" ON clients;
CREATE POLICY "Allow all for service role" ON clients
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- INVENTORY tablosu
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON inventory;
CREATE POLICY "Allow all for authenticated users" ON inventory
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read for anon" ON inventory;
CREATE POLICY "Allow read for anon" ON inventory
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow all for service role" ON inventory;
CREATE POLICY "Allow all for service role" ON inventory
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- BOOKINGS tablosu
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON bookings;
CREATE POLICY "Allow all for authenticated users" ON bookings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read for anon" ON bookings;
CREATE POLICY "Allow read for anon" ON bookings
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow all for service role" ON bookings;
CREATE POLICY "Allow all for service role" ON bookings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- PROJECTS tablosu
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON projects;
CREATE POLICY "Allow all for authenticated users" ON projects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read for anon" ON projects;
CREATE POLICY "Allow read for anon" ON projects
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow all for service role" ON projects;
CREATE POLICY "Allow all for service role" ON projects
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- PROPOSALS tablosu
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON proposals;
CREATE POLICY "Allow all for authenticated users" ON proposals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read for anon" ON proposals;
CREATE POLICY "Allow read for anon" ON proposals
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow all for service role" ON proposals;
CREATE POLICY "Allow all for service role" ON proposals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- USERS tablosu (sadece service_role erişimi)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON users;
CREATE POLICY "Allow all for service role" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read own data" ON users;
CREATE POLICY "Allow read own data" ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- 4. ÖRNEK VERİ EKLEME (Opsiyonel)
-- =====================================================

-- Müşteri talebi örnek verisi
-- INSERT INTO customer_requests (request_number, client_id, product_type, quantity, start_date, end_date, status, priority, notes)
-- SELECT 
--     'TLP-' || TO_CHAR(NOW(), 'YYMMDD') || '-0001',
--     id,
--     'billboard',
--     10,
--     CURRENT_DATE + INTERVAL '7 days',
--     CURRENT_DATE + INTERVAL '37 days',
--     'pending',
--     'high',
--     'Test talebi - Karşıyaka bölgesi tercih ediliyor'
-- FROM clients
-- WHERE company_name ILIKE '%karşıyaka%'
-- LIMIT 1;

SELECT 'Supabase setup completed successfully!' as message;
