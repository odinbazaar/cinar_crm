-- Tüm tablolar için RLS'yi devre dışı bırak (geliştirme için)

-- CLIENTS
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;

-- CUSTOMER_REQUESTS  
ALTER TABLE IF EXISTS customer_requests DISABLE ROW LEVEL SECURITY;

-- INVENTORY
ALTER TABLE IF EXISTS inventory DISABLE ROW LEVEL SECURITY;

-- BOOKINGS
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- PROJECTS
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;

-- PROPOSALS
ALTER TABLE IF EXISTS proposals DISABLE ROW LEVEL SECURITY;

-- USERS - dikkat: bu tablo RLS açık kalmalı güvenlik için
-- Ama service_role kullandığımız için sorun olmayacak

SELECT 'RLS disabled for all tables!' as result;
