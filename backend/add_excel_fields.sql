-- clients tablosuna Arayan Firmalar Excel dosyasındaki yeni alanları ekle
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS request_detail TEXT,
ADD COLUMN IF NOT EXISTS called_phone TEXT;

-- Yorum ekleyelim (isteğe bağlı)
COMMENT ON COLUMN public.clients.request_detail IS 'Arayan firmanın talebi (Excel: TALEP)';
COMMENT ON COLUMN public.clients.called_phone IS 'Firmanın aradığı telefon numarası (Excel: ARANAN TEL)';
