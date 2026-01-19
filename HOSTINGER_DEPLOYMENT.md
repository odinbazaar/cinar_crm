# ✅ Hostinger Setup Rehberi - cınarcrm.online

## 📊 Mevcut Durum (Screenshot Analizi)

### Coolify
- ✅ Kurulu ve çalışıyor
- ✅ Project: "cinar-crm" (production environment)
- ✅ Frontend application mevcut
- ✅ Backend application mevcut

### Hostinger
- ✅ **Domain:** cınarcrm.online (Türkçe ı ile)
- ✅ **Subdomain:** backend.cınarcrm.online
- ✅ **VPS:** KVM 2 - srv922805.hstgr.cloud
- ✅ **Durum:** Aktif ve çalışıyor

### Environment Variables
- ✅ Frontend API URL: https://backend.cınarcrm.online/api
- ✅ Backend FRONTEND_URL: https://cınarcrm.online
- ✅ Supabase bağlantıları ayarlı

---

## 🎯 ŞİMDİ YAPILACAKLAR

### 1️⃣ VPS IP Adresini Bul (Hostinger)

Hostinger panel'de:
```
1. VPS → srv922805.hstgr.cloud
2. Overview/Genel Bakış sekmesi
3. IP Address'i kopyala
   Örnek: 45.123.45.67
```

**ÖNEMLİ:** Bu IP'yi not edin, DNS ayarlarında kullanacağız!

---

### 2️⃣ DNS Ayarları (Hostinger)

Hostinger'da domain DNS ayarlarını yapın:

#### A) cınarcrm.online için:
```
Hostinger → Domains → cınarcrm.online → DNS Yönetimi

Ekle/Düzenle:
Type: A
Name: @ (veya boş)
Points to: [VPS IP Adresi]
TTL: 3600

Kaydet
```

#### B) backend.cınarcrm.online için:
```
Type: A
Name: backend
Points to: [VPS IP Adresi]
TTL: 3600

Kaydet
```

---

### 3️⃣ Coolify'da Domain Ekleme

#### Frontend Domain:
```
Coolify Dashboard → Resources → Projects → cinar-crm → frontend

1. Configuration tab'ına git
2. Domains sekmesine tıkla
3. Add Domain: cınarcrm.online
4. SSL: Enable (Let's Encrypt)
5. Save
```

#### Backend Domain:
```
Backend application (odinbazaar/cinar_crm...)

1. Configuration → Domains
2. Add Domain: backend.cınarcrm.online
3. SSL: Enable
4. Save
```

---

### 4️⃣ Coolify Environment Variables

#### Frontend Application

Coolify → Frontend → Configuration → Environment

Her variable için ayrı ayrı ekle:

```bash
VITE_API_URL
```
Value:
```
https://backend.cınarcrm.online/api
```
✅ Is Literal
✅ Available at Runtime

---

```bash
VITE_SUPABASE_URL
```
Value:
```
https://laltmysfkyppkqykggmh.supabase.co
```

---

```bash
VITE_SUPABASE_ANON_KEY
```
Value:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo
```

---

```bash
VITE_COMPANY_NAME
```
Value:
```
İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.
```

---

```bash
VITE_COMPANY_ADDRESS
```
Value:
```
MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR
```

---

```bash
VITE_COMPANY_PHONE
```
Value:
```
0232 431 0 75
```

---

```bash
VITE_COMPANY_FAX
```
Value:
```
0232 431 00 73
```

---

```bash
VITE_COMPANY_TAX_OFFICE
```
Value:
```
KARŞIYAKA V.D.
```

---

```bash
VITE_COMPANY_TAX_NO
```
Value:
```
6490546546
```

#### Backend Application

```bash
SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU
JWT_SECRET=cinar-crm-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://cınarcrm.online
MAIL_HOST=smtp.yandex.com.tr
MAIL_PORT=465
MAIL_USER=Rezervasyon@izmiracikhavareklam.com
MAIL_PASS=Reziar.075
MAIL_FROM="Çınar CRM" <Rezervasyon@izmiracikhavareklam.com>
ALI_MAIL_PASS=Reziar.075
```

---

### 5️⃣ Git Push ve Deploy

```bash
git add .
git commit -m "fix: build error and configure for Hostinger deployment"
git push
```

Coolify otomatik algılar ve deploy eder!

**VEYA Manuel:**
```
Coolify → Frontend → Restart Project (Force Rebuild)
Coolify → Backend → Restart Project
```

---

### 6️⃣ DNS Propagation Bekle

DNS değişiklikleri 5-10 dakika içinde aktif olur.

**Kontrol:**
```powershell
nslookup cınarcrm.online
# Şunu görmeli: [VPS IP Adresi]
```

---

### 7️⃣ Test

```
1. https://cınarcrm.online → Frontend açılmalı
2. https://backend.cınarcrm.online/api → API çalışmalı
3. Login test et
4. SSL sertifikası geçerli (🔒) olmalı
```

---

## 📋 Checklist

### Hazırlık
- [x] TypeScript build hatası düzeltildi
- [x] Domain doğru: cınarcrm.online
- [x] Environment dosyaları güncellendi
- [x] Hostinger'da VPS aktif
- [x] Coolify kurulu ve çalışıyor

### DNS Ayarları
- [ ] VPS IP adresi not edildi
- [ ] A Record: @ → VPS IP (cınarcrm.online)
- [ ] A Record: backend → VPS IP
- [ ] DNS kaydetme yapıldı

### Coolify
- [ ] Frontend domain eklendi: cınarcrm.online
- [ ] Backend domain eklendi: backend.cınarcrm.online
- [ ] SSL aktif (Let's Encrypt)
- [ ] Frontend environment variables set edildi
- [ ] Backend environment variables set edildi

### Deployment
- [ ] Git push yapıldı
- [ ] Coolify build başarılı (yeşil ✓)
- [ ] Frontend deployed
- [ ] Backend deployed

### Test
- [ ] DNS çözümleniyor (nslookup)
- [ ] https://cınarcrm.online açılıyor
- [ ] Dashboard yükleniyor
- [ ] Login yapılabiliyor
- [ ] API çağrıları çalışıyor

---

## 🔧 VPS IP Nasıl Bulunur (Hostinger)

### Yöntem 1: Hostinger Panel
```
1. Sol menüden "VPS" seçeneğine tıkla
2. srv922805.hstgr.cloud'a tıkla
3. "Overview" veya ilk açılan sayfada
4. "IP Address" bilgisini kopyala
```

### Yöntem 2: SSH ile
```bash
# Eğer SSH erişiminiz varsa
ssh root@srv922805.hstgr.cloud

# Sonra:
curl ifconfig.me
# veya
hostname -I
```

---

## 🚨 Önemli Notlar

### Türkçe Karakter (IDN)
Domain: **cınarcrm.online** (Türkçe 'ı' karakteri var)
- Browser otomatik Punycode'a çevirir
- Punycode: `xn--cnarcrm-xva.online`
- DNS'de her ikisi de çalışır

### SSL Sertifikası
- DNS çözümlenmeden SSL oluşturulamaz
- Önce DNS'i yap, sonra SSL'i aktif et
- Coolify otomatik Let's Encrypt kullanır

### CORS
- Frontend URL tam olarak eşleşmeli
- Sonunda `/` olmamalı
- `https://cınarcrm.online` ✅
- `https://cınarcrm.online/` ❌

---

## 📞 Sonraki Adımlar

1. **VPS IP'yi bul** ve paylaş
2. **DNS ayarlarını yap** (Hostinger panel)
3. **Coolify'da domain ekle**
4. **Environment variables set et**
5. **Deploy et ve test et**

Şu anda hangi adımdasınız? Yardıma ihtiyacınız olan kısım? 🚀

