-- Çınar CRM - Admin Kullanıcısı Oluştur
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- Şifre: admin123

-- Önce varsa sil (opsiyonel)
DELETE FROM users WHERE email = 'admin@cinar.com';

-- Admin kullanıcısı oluştur
-- Şifre hash'i bcrypt ile oluşturulmuş: admin123
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    status, 
    phone, 
    hourly_rate
)
VALUES (
    'admin@cinar.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE',
    '+90 532 123 4567',
    150.00
);

-- Kullanıcının oluşturulduğunu kontrol et
SELECT id, email, first_name, last_name, role, status, created_at 
FROM users 
WHERE email = 'admin@cinar.com';
