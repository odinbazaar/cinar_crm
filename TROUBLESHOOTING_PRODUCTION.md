# 🔧 Canlı Ortam Sorun Giderme

## ❌ Problem: Değişiklikler Canlıda Görünmüyor

### Hızlı Çözüm Adımları

#### 1. Frontend için (Coolify)
```bash
# Coolify Dashboard'da:
1. Frontend projesine git
2. "Configuration" → "Environment" sekmesine tıkla
3. Tüm environment variable'ların doğru olduğunu kontrol et
4. "Restart Project" butonuna tıkla (bu yeniden build yapar)
5. Build log'ları izle ve hata olup olmadığını kontrol et

# VEYA Manuel build:
cd frontend
npm run build  # dist klasörü oluşur
# Coolify'a dist klasörünü yükle
```

#### 2. Backend için (Coolify)
```bash
# Coolify Dashboard'da:
1. Backend projesine git
2. "Restart Project" butonuna tıkla
3. Log'ları kontrol et

# Backend değişiklikleri genellikle restart ile yüklenir
```

#### 3. Cache Temizleme
```bash
# Browser cache'i temizle:
1. CTRL + SHIFT + DELETE (Chrome/Edge)
2. "Cached images and files" seç
3. "Clear data" tıkla

# VEYA Hard Reload:
CTRL + SHIFT + R (Windows)
CMD + SHIFT + R (Mac)
```

### ⚠️ Önemli: VITE_ Environment Variables

**Frontend'de VITE_ ile başlayan değişkenler BUILD sırasında kodun içine gömülür!**

Yani:
- ❌ Environment variable değiştirip sadece restart etmek YETERSİZ
- ✅ Environment variable değiştirdikten sonra MUTLAKA yeniden BUILD yapmalısınız

```bash
# Frontend environment değişikliğinden sonra:
cd frontend
rm -rf dist         # Eski build'i sil
npm run build       # Yeni build
# Coolify'a yeni dist'i deploy et
```

### 🔍 Değişikliklerin Yüklendiğini Kontrol Etme

#### Frontend Kontrolü
1. Browser'da siteyi aç: `https://cinarcrm.online`
2. F12 → Console
3. Şunu çalıştır:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_API_URL)
```
4. Doğru URL'leri görmeli:
   - `https://laltmysfkyppkqykggmh.supabase.co`
   - `https://backend.cinarcrm.online/api`

#### Backend Kontrolü
```bash
# Browser'da aç:
https://backend.cinarcrm.online/api

# Veya curl ile test:
curl https://backend.cinarcrm.online/api
```

### 📋 Environment Variable Checklist

#### Frontend (.env.production)
- [ ] VITE_API_URL=https://backend.cinarcrm.online/api
- [ ] VITE_SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
- [ ] VITE_SUPABASE_ANON_KEY=(anon key)
- [ ] Tüm VITE_COMPANY_* değerleri doğru

#### Backend (.env.production)
- [ ] SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
- [ ] SUPABASE_ANON_KEY=(anon key)
- [ ] SUPABASE_SERVICE_ROLE_KEY=(service role key)
- [ ] FRONTEND_URL=https://cinarcrm.online
- [ ] JWT_SECRET=(güçlü secret)
- [ ] Mail ayarları doğru

### 🚨 Sık Karşılaşılan Hatalar

#### 1. CORS Hatası
```
Access to XMLHttpRequest at 'https://backend...' from origin 'https://cinarcrm.online' 
has been blocked by CORS policy
```

**Çözüm:**
```bash
# Backend .env dosyasında:
FRONTEND_URL=https://cinarcrm.online  # Tam olarak aynı olmalı, / ile bitmemeli
```

#### 2. 404 Not Found
```
GET https://backend.cinarcrm.online/api/... 404
```

**Çözüm:**
- Backend çalışıyor mu kontrol et (Coolify logs)
- API endpoint'leri doğru mu kontrol et
- Backend port 3000'de dinliyor mu kontrol et

#### 3. Supabase Connection Error
```
Failed to fetch from Supabase
```

**Çözüm:**
```bash
# Supabase URL ve key'leri kontrol et:
# Frontend için browser console'da:
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

# Coolify'da environment variable'ları kontrol et
# "Is Literal?" checkbox'ı işaretli olmalı
```

#### 4. Blank Page (Boş Sayfa)
**Çözüm:**
```bash
# Browser console (F12) hatayı gösterir
# Genellikle:
- JavaScript hatası
- API bağlantı problemi
- Build hatası

# Coolify build log'larını kontrol et
```

### 🔄 Deployment Workflow

#### Her Değişiklikten Sonra:

**1. Backend Değişiklikleri:**
```bash
cd backend
npm run build              # Local test
# Git'e push (Coolify otomatik deploy eder)
# VEYA Coolify'da "Redeploy" butonuna tıkla
```

**2. Frontend Değişiklikleri:**
```bash
cd frontend
npm run build              # Local test
# Git'e push (Coolify otomatik deploy eder)
# VEYA Coolify'da "Redeploy" butonuna tıkla

# Environment variable değiştiysen:
# Coolify'da "Restart Project" (rebuild yapar)
```

**3. Environment Variable Değişiklikleri:**
```bash
# Coolify'da:
1. Configuration → Environment
2. Variable'ı güncelle
3. "Update" butonuna tıkla
4. Frontend için: "Restart Project" (rebuild gerekli!)
5. Backend için: "Restart Project" (restart gerekli)
```

### 🧪 Test Senaryosu

```bash
# 1. Local test
cd frontend
npm run build
npm run preview  # Production build'i test et

cd ../backend
npm run build
npm run start:prod  # Production mode'da başlat

# 2. Supabase bağlantı testi
# Browser console:
fetch('https://laltmysfkyppkqykggmh.supabase.co/rest/v1/users?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)

# 3. Backend API testi
fetch('https://backend.cinarcrm.online/api/health')
  .then(r => r.json())
  .then(console.log)
```

### 📞 Debug Checklist

Eğer hala çalışmıyorsa, şunları kontrol et:

- [ ] Coolify'da build başarılı mı? (yeşil ✓)
- [ ] Environment variable'lar Coolify'da doğru mu?
- [ ] Frontend'de VITE_ değişkenleri var mı?
- [ ] Backend'de SUPABASE_* değişkenleri var mı?
- [ ] Browser cache temizlenmiş mi? (CTRL+SHIFT+R)
- [ ] Supabase project çalışıyor mu? (Supabase dashboard kontrol et)
- [ ] Domain DNS ayarları doğru mu?
- [ ] SSL sertifikaları geçerli mi?

### 💡 Pro Tips

1. **Her zaman build log'larını oku**: Hata genellikle orada görünür
2. **Browser DevTools kullan**: Network tab'ında hangi request'lerin fail olduğunu gör
3. **Environment'ı doğrula**: Console'da environment variable'ları yazdır
4. **Incremental deploy**: Küçük değişiklikler yap ve test et
5. **Git kullan**: Her deployment'ı commit'le, kolayca geri alabilirsin

### 🎯 Hızlı Fix - Şu Anda Yapılacaklar

```bash
# Coolify Dashboard:

# Frontend için:
1. Sol menüden frontend projesini seç
2. Sağ üstte "Restart Project" butonuna tıkla
3. "Force Rebuild" seçeneğini işaretle
4. Build log'ları izle (3-5 dakika sürer)
5. Build tamamlandığında browser'da CTRL+SHIFT+R yap

# Backend için:
1. Sol menüden backend projesini seç  
2. "Restart Project" butonuna tıkla
3. Log'ları izle
4. "Running" durumuna gelene kadar bekle

# Her iki deployment da tamamlandığında:
1. Browser'ı aç (Incognito mode önerilir)
2. https://cinarcrm.online adresine git
3. Login yap ve test et
```

### 📊 Deployment Status Monitoring

```bash
# Coolify'da her proje için:
- Status: "Running" ✅
- Last deployment: "Success" ✅
- Health check: "Healthy" ✅

# Eğer "Failed" görürsen:
- Build/Deploy log'larını kontrol et
- Environment variable'ları kontrol et
- Port çakışması var mı kontrol et
```
