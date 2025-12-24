-- Clients tablosundaki mevcut sütunları kontrol et
-- ve sadece var olan sütunların constraint'lerini kaldır

-- Önce hangi sütunların olduğunu görelim
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;
