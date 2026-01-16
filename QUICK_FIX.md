# ⚡ Hızlı Çözüm: Değişiklikler Canlıda Görünmüyor

## 🎯 EN HIZLI ÇÖZÜM (3 Dakika)

### Adım 1: Coolify'da Frontend Rebuild
```
1. Coolify Dashboard'u aç
2. Sol menüden FRONTEND projesini seç
3. Sağ üstte "Restart Project" butonuna tıkla
4. ✅ "Force Rebuild" seçeneğini işaretle
5. Rebuild başlasın (3-5 dakika)
```

### Adım 2: Coolify'da Backend Restart
```
1. Sol menüden BACKEND projesini seç
2. "Restart Project" butonuna tıkla
3. Log'larda "Running" görene kadar bekle (1-2 dakika)
```

### Adım 3: Browser Cache Temizle
```
1. CTRL + SHIFT + DELETE (Windows/Linux)
2. "Cached images and files" seç
3. "All time" seç
4. Clear data

VEYA sadece:
CTRL + SHIFT + R (Hard Reload)
```

### Adım 4: Test Et
```
1. https://cinarcrm.online adresine git
2. F12 bas (Developer Tools)
3. Console tab'ına git
4. Şunu yapıştır:

console.log('API:', import.meta.env.VITE_API_URL);
console.log('Supabase:', import.meta.env.VITE_SUPABASE_URL);

5. Şunu görmeli:
   API: https://backend.cinarcrm.online/api
   Supabase: https://slanoowprgrcksfqrgak.supabase.co
```

---

## 🔍 Hala Çalışmıyor mu?

### Environment Variable'ları Kontrol Et

#### Coolify Frontend Environment:
```bash
VITE_API_URL=https://backend.cinarcrm.online/api
VITE_SUPABASE_URL=https://slanoowprgrcksfqrgak.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU2NzYsImV4cCI6MjA4MDM2MTY3Nn0.mbm0PFKd-dkIJmMlu9-DLlIvghDzKsLudwtOR6vT28U
VITE_COMPANY_NAME=İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.
VITE_COMPANY_ADDRESS=MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR
VITE_COMPANY_PHONE=0232 431 0 75
VITE_COMPANY_FAX=0232 431 00 73
VITE_COMPANY_TAX_OFFICE=KARŞIYAKA V.D.
VITE_COMPANY_TAX_NO=6490546546
```

**ÖNEMLİ:** Her variable için:
- ✅ "Is Literal?" checkbox'ını işaretle
- ✅ "Available at Runtime" işaretle
- ✅ Update butonuna tıkla

#### Coolify Backend Environment:
```bash
SUPABASE_URL=https://slanoowprgrcksfqrgak.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU2NzYsImV4cCI6MjA4MDM2MTY3Nn0.mbm0PFKd-dkIJmMlu9-DLlIvghDzKsLudwtOR6vT28U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.bawYE2ig0yEmje8bAEvD9qcrngcmI0r2qV61OeLGu-M
JWT_SECRET=cinar-crm-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://cinarcrm.online
MAIL_HOST=smtp.yandex.com.tr
MAIL_PORT=465
MAIL_USER=Rezervasyon@izmiracikhavareklam.com
MAIL_PASS=Reziar.075
MAIL_FROM="Çınar CRM" <Rezervasyon@izmiracikhavareklam.com>
ALI_MAIL_PASS=Reziar.075
```

---

## 🚨 Sık Hatalar ve Çözümler

### 1. "Failed to fetch" Hatası
```
✅ Backend çalışıyor mu kontrol et
✅ VITE_API_URL doğru mu kontrol et
✅ CORS ayarları FRONTEND_URL ile eşleşiyor mu
```

### 2. Supabase Bağlantı Hatası
```
✅ VITE_SUPABASE_URL doğru mu
✅ VITE_SUPABASE_ANON_KEY set edilmiş mi
✅ Supabase project aktif mi (supabase.co dashboard'da kontrol et)
```

### 3. 404 Not Found
```
✅ Backend deploy edilmiş mi
✅ Backend "Running" durumunda mı
✅ API endpoint'leri doğru mu (/api prefix)
```

### 4. Boş Sayfa (Blank Page)
```
✅ F12 → Console'da hata var mı
✅ Build başarılı mı (Coolify log'ları)
✅ Environment variable'lar eksik mi
```

---

## 📱 Mobil Test

Mobilde de test et:
1. Telefon ile aynı network'e bağlan
2. https://cinarcrm.online aç
3. Değişiklikleri kontrol et

---

## 🎬 Video Gibi Adım Adım

### Coolify'da Environment Update:
```
1. Projects → [Frontend projen] → Configuration
2. Environment tab'ına tıkla
3. "Danger Zone" altında environment variables'ı gör
4. Her variable için:
   - Name: VITE_SUPABASE_URL
   - Value: https://slanoowprgrcksfqrgak.supabase.co
   - ✅ Is Literal? (checkbox işaretle)
   - ✅ Available at Runtime (checkbox işaretle)
   - Update butonuna tıkla
5. Tüm variable'lar tamamlandığında:
   - Yukarı çık
   - "Restart Project" butonuna tıkla
   - ✅ Force Rebuild seç
   - Confirm
6. Log'ları izle: "Building..." → "Deploying..." → "Running" ✅
```

---

## ✅ Checklist

Sırayla kontrol et:

- [ ] Coolify'da frontend environment variable'ları doğru
- [ ] Coolify'da backend environment variable'ları doğru
- [ ] Frontend "Restart Project" ile rebuild edildi
- [ ] Backend "Restart Project" ile restart edildi
- [ ] Build log'ları başarılı (yeşil ✓)
- [ ] Backend log'larında "Listening on port 3000" gözüküyor
- [ ] Browser cache temizlendi (CTRL+SHIFT+R)
- [ ] Console'da environment variable'lar doğru
- [ ] API çağrıları başarılı (Network tab'ında 200 OK)
- [ ] Login çalışıyor
- [ ] Değişiklikler görünüyor ✅

---

## 🆘 Hala Çalışmıyor - Son Çare

1. **Full Clean Deploy:**
```
Coolify'da:
- Frontend projesini SİL
- Backend projesini SİL
- Yeniden oluştur ve deploy et
```

2. **Local Test:**
```bash
cd frontend
npm run build
npm run preview  # http://localhost:4173

# Test et - çalışıyor mu?
# Evet → Problem Coolify'da
# Hayır → Problem kodda
```

3. **Bana Ulaş:**
```
Şunları paylaş:
- Coolify build log'ları (screenshot)
- Browser console hataları (screenshot)
- Network tab'ındaki failed requests (screenshot)
```
