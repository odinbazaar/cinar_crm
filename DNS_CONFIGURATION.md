# 🌐 Domain Bilgileri - cınar.online

## ✅ Doğru Domain Adı

**Frontend:** `https://cınar.online` (Türkçe 'ı' ile)
**Backend:** `https://backend.cınar.online`

## 🔤 Önemli: Türkçe Karakter (IDN)

Domain adında Türkçe karakter var: **ı** (dotless i)

### Punycode Karşılığı
Browser'lar Türkçe karakterleri otomatik Punycode'a çevirir:
- `cınar.online` → `xn--cnar-5qa.online` (Punycode)

### DNS Ayarlarında Kullanım
Domain registrar'da (GoDaddy, Namecheap, vb.) DNS ayarları yaparken:
- ✅ **Türkçe yazın**: `cınar.online` 
- ✅ **VEYA Punycode**: `xn--cnar-5qa.online`
- Her ikisi de çalışır

---

## 🚀 Coolify Konfigürasyonu

### Frontend Domain Ayarı
```
Coolify → Frontend Project → Configuration → Domains
➕ Add Domain: cınar.online
✅ Enable SSL (Let's Encrypt)
💾 Save
```

### Backend Domain Ayarı
```
Coolify → Backend Project → Configuration → Domains
➕ Add Domain: backend.cınar.online
✅ Enable SSL
💾 Save
```

---

## 🌍 DNS Ayarları (Domain Registrar)

Domain satın aldığınız yerde (GoDaddy, Namecheap, Hostinger, vb.):

### Frontend için:
```
Type: A Record
Host: @ (veya boş bırak)
Points to: [Coolify Sunucu IP Adresi]
TTL: 3600
```

### Backend için:
```
Type: A Record
Host: backend
Points to: [Coolify Sunucu IP Adresi]
TTL: 3600
```

### www için (opsiyonel):
```
Type: CNAME
Host: www
Points to: cınar.online
TTL: 3600
```

---

## 🔧 Environment Variables (Güncellenmiş)

### Frontend (.env.production)
```bash
VITE_API_URL=https://backend.cınar.online/api
VITE_SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo
VITE_COMPANY_NAME=İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.
VITE_COMPANY_ADDRESS=MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR
VITE_COMPANY_PHONE=0232 431 0 75
VITE_COMPANY_FAX=0232 431 00 73
VITE_COMPANY_TAX_OFFICE=KARŞIYAKA V.D.
VITE_COMPANY_TAX_NO=6490546546
```

### Backend (.env.production)
```bash
SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU
JWT_SECRET=cinar-crm-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://cınar.online
MAIL_HOST=smtp.yandex.com.tr
MAIL_PORT=465
MAIL_USER=Rezervasyon@izmiracikhavareklam.com
MAIL_PASS=Reziar.075
MAIL_FROM="Çınar CRM" <Rezervasyon@izmiracikhavareklam.com>
ALI_MAIL_PASS=Reziar.075
```

---

## 🔍 DNS Kontrol

### PowerShell'de kontrol:
```powershell
# Türkçe domain ile
nslookup cınar.online

# Punycode ile
nslookup xn--cnar-5qa.online

# Başarılı ise şunu göreceksiniz:
Address: [Coolify Sunucu IP]
```

### Online DNS Kontrol:
1. https://dnschecker.org/ adresine git
2. **cınar.online** yaz
3. Check butonuna tıkla
4. Yeşil tik ✅ görmeli (tüm dünyada yayıldı)
5. Kırmızı X ❌ görürsen (henüz yayılmadı, bekle)

---

## 📋 Deployment Checklist

### 1. Domain Satın Alındı mı?
- [ ] cınar.online domain satın alındı
- [ ] Domain registrar: ________________
- [ ] DNS yönetim paneline erişim var

### 2. DNS Ayarları
- [ ] A Record: @ → Coolify IP
- [ ] A Record: backend → Coolify IP
- [ ] TTL: 3600 (veya auto)
- [ ] Kaydetme yapıldı

### 3. Coolify Konfigürasyonu
- [ ] Frontend domain: cınar.online eklendi
- [ ] Backend domain: backend.cınar.online eklendi
- [ ] SSL aktif (Let's Encrypt)
- [ ] Environment variables set edildi

### 4. Build ve Deploy
- [ ] Frontend build başarılı ✅
- [ ] Backend build başarılı ✅
- [ ] Deployment "Running" durumunda
- [ ] Health check geçiyor

### 5. Test
- [ ] DNS çözümleniyor
- [ ] SSL sertifikası geçerli (🔒)
- [ ] https://cınar.online açılıyor
- [ ] https://backend.cınar.online/api çalışıyor
- [ ] Login başarılı

---

## ⏱️ DNS Propagation Süresi

DNS değişiklikleri hemen aktif olmaz:
- **Minimum**: 5-10 dakika
- **Ortalama**: 1-2 saat
- **Maksimum**: 24-48 saat

### Hızlandırma İpuçları:
1. TTL değerini düşük tut (3600 veya 300)
2. DNS cache temizle (bilgisayarda):
   ```powershell
   ipconfig /flushdns
   ```
3. Farklı DNS kullan (geçici test için):
   - Google DNS: 8.8.8.8
   - Cloudflare DNS: 1.1.1.1

---

## 🚨 Sorun Giderme

### "Bu siteye ulaşılamıyor" (DNS hatası)
**Sebep:** DNS henüz yayılmadı veya yanlış yapılandırıldı

**Çözüm:**
1. DNS ayarlarını kontrol et (A Record doğru mu?)
2. DNS propagation bekle (dnschecker.org)
3. Coolify auto-domain ile test et (geçici)

### SSL Sertifikası Hatası
**Sebep:** DNS çözümlenmeden SSL oluşturulamaz

**Çözüm:**
1. Önce DNS'in çalıştığından emin ol
2. Sonra Coolify'da SSL'i aktif et
3. Let's Encrypt otomatik sertifika oluşturur

### CORS Hatası
**Sebep:** Backend FRONTEND_URL yanlış

**Çözüm:**
```bash
# Backend .env.production'da:
FRONTEND_URL=https://cınar.online
# Tam olarak böyle olmalı (/ ile bitmemeli)
```

---

## 🎯 ŞİMDİ NE YAPMALI?

### Domain Sahibiyseniz:
1. ✅ Environment dosyaları güncellendi (`cınar.online` ile)
2. ⏭️ **DNS ayarlarını yapın** (A Record ekleyin)
3. ⏭️ **Coolify'da domain ekleyin**
4. ⏭️ **DNS propagation bekleyin** (5-10 dakika)
5. ⏭️ **Git push ve deploy edin**
6. ⏭️ **Test edin**: https://cınar.online

### Domain Henüz Yoksa:
1. ⏭️ **Coolify auto-domain ile test edin** (hemen çalışır)
2. ⏭️ **Domain satın alın**: cınar.online
3. ⏭️ **DNS ayarlarını yapın**
4. ⏭️ **Production deploy edin**

### Local Test (Şimdi):
```bash
# Preview server zaten çalışıyor!
# Browser'da aç:
http://localhost:4173
```

---

## 📞 Yardım

Hangi domain registrar kullanıyorsunuz? İhtiyacınız varsa o platforma özel DNS setup talimatları verebilirim:

- GoDaddy
- Namecheap
- Hostinger
- Cloudflare
- Diğer: ________________

Domain durumunu paylaşın, birlikte ayarlayalım! 🚀
