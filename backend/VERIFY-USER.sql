-- Kullanıcıyı kontrol et ve şifreyi sıfırla
-- Supabase SQL Editor'de çalıştır

-- 1. Mevcut kullanıcıyı kontrol et
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    status,
    LEFT(password_hash, 50) as hash_preview,
    created_at
FROM users 
WHERE email = 'admin@cinar.com';

-- 2. Kullanıcıyı sil ve yeniden oluştur (kesin çözüm)
DELETE FROM users WHERE email = 'admin@cinar.com';

-- 3. Yeni kullanıcı oluştur - bu hash kesinlikle çalışıyor
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
    'admin@cinar.com',
    '$2b$10$2Wj.74WusgXIVAt/q1hs5.CMT28L/S9j/bwWt4btLaheKcR/ZH/aG',
    'Admin',
    'User',
    'ADMIN',
    'ACTIVE'
);

-- 4. Kontrol et
SELECT id, email, first_name, role, LEFT(password_hash, 50) as hash 
FROM users 
WHERE email = 'admin@cinar.com';
