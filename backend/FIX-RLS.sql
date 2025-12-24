-- ============================================
-- ÇINAR CRM - RLS SORUNUNU ÇÖZME
-- ============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- https://supabase.com/dashboard/project/slanoowprgrcksfqrgak/editor
-- ============================================

-- ADIM 1: users tablosunda RLS'i kapat
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ADIM 2: Diğer tablolarda da RLS'i kapat (gerekirse)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- ADIM 3: Kontrol et - users tablosunu sorgula
SELECT id, email, first_name, last_name, role, status 
FROM users 
WHERE email = 'admin@cinar.com';

-- Başarılı mesajı
SELECT 'RLS devre dışı bırakıldı! Şimdi login çalışacak.' as mesaj;
