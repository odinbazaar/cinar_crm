-- ============================================
-- ÇINAR CRM - ADMIN KULLANICI OLUŞTURMA
-- ============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- https://supabase.com/dashboard/project/slanoowprgrcksfqrgak/editor
-- ============================================

-- Adım 1: Eski admin kullanıcısını sil (varsa)
DELETE FROM users WHERE email = 'admin@cinar.com';

-- Adım 2: Yeni admin kullanıcısı oluştur
-- Email: admin@cinar.com
-- Şifre: admin123
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    status
)
VALUES (
    'admin@cinar.com',
    '$2b$10$2Wj.74WusgXIVAt/q1hs5.CMT28L/S9j/bwWt4btLaheKcR/ZH/aG',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE'
);

-- Adım 3: Kullanıcının başarıyla oluşturulduğunu kontrol et
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    status,
    created_at,
    'Kullanıcı başarıyla oluşturuldu! Şifre: admin123' as mesaj
FROM users 
WHERE email = 'admin@cinar.com';
