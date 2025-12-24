-- Clients tablosuna eksik sütunları ekle
-- Bu script mevcut verileri bozmadan yeni sütunlar ekler

-- Şirket bilgileri
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS trade_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_office VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);

-- Adres bilgileri (bunlar zaten olabilir)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Türkiye';

-- İletişim bilgileri
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fax VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Yetkili kişi bilgileri
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_title VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- CRM alanları
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_stage VARCHAR(50) DEFAULT 'lead';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_manager_id UUID;

-- Durum ve aktiflik
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'potential';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- İstatistikler
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(15,2) DEFAULT 0;

-- Zaman damgaları (bunlar zaten olabilir)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

SELECT 'Clients tablosu güncellendi!' as result;
