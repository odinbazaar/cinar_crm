# 🎯 SON ADIM: DNS Ayarları - cınarcrm.online

## ✅ VPS IP Adresi: 72.60.178.139

## 📋 DNS A Records Ekleme (Hostinger)

### ADIM 1: Hostinger DNS Yönetimine Git

```
1. Hostinger → Sol menü → "Domains" veya "Domainler"
2. "cınarcrm.online" domain'ine tıkla
3. "DNS Yönetimi" veya "DNS Management" sekmesine git
```

### ADIM 2: A Record Ekle (Frontend için)

```
Type: A
Name: @ (veya boş bırak)
Points to: 72.60.178.139
TTL: 3600 (veya Auto)

[ADD/EKLE] butonuna tıkla
```

➡️ Bu, `cınarcrm.online` domain'ini VPS IP'nize yönlendirir.

### ADIM 3: A Record Ekle (Backend için)

```
Type: A
Name: backend
Points to: 72.60.178.139
TTL: 3600

[ADD/EKLE] butonuna tıkla
```

➡️ Bu, `backend.cınarcrm.online` subdomain'ini oluşturur.

### ADIM 4: Kaydet

Tüm değişiklikleri kaydet. DNS değişiklikleri 5-10 dakika içinde aktif olur.

---

## 🔍 DNS Kontrolü (5-10 dakika sonra)

```powershell
# Frontend
nslookup cınarcrm.online
# Görmeli: Address: 72.60.178.139

# Backend
nslookup backend.cınarcrm.online
# Görmeli: Address: 72.60.178.139
```

**VEYA Online kontrol:**
```
https://dnschecker.org/
Domain: cınarcrm.online
✅ Yeşil tik görmeli
```

---

## 🚀 Coolify'da Domain Ekleme

### Frontend Domain

```
Coolify Dashboard → Resources → Projects → cinar-crm → frontend application

1. Configuration tab
2. Domains sekmesi
3. ➕ Add Domain
4. Domain: cınarcrm.online
5. ✅ Generate SSL (Let's Encrypt)
6. Save
```

### Backend Domain

```
Backend application seç

1. Configuration → Domains
2. ➕ Add Domain
3. Domain: backend.cınarcrm.online
4. ✅ Generate SSL
5. Save
```

---

## ⏰ Bekleme Süresi

1. **DNS Propagation:** 5-10 dakika (bazen 1-2 saat)
2. **SSL Generation:** DNS aktif olduktan sonra 2-5 dakika

---

## ✅ Son Kontroller

### 1. DNS Çalışıyor mu?
```powershell
nslookup cınarcrm.online
# Sonuç: 72.60.178.139 ✅
```

### 2. Coolify'da Build Başarılı mı?
```
Coolify → Frontend → Deployments
Status: ✅ Running (yeşil)

Coolify → Backend → Deployments  
Status: ✅ Running (yeşil)
```

### 3. Environment Variables Set Edildi mi?
```
Frontend → Configuration → Environment
✅ VITE_API_URL
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_COMPANY_* değişkenleri

Backend → Configuration → Environment
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ FRONTEND_URL
✅ Mail settings
```

### 4. SSL Aktif mi?
```
Coolify → Frontend → Domains
🔒 SSL: Active/Aktif

Coolify → Backend → Domains
🔒 SSL: Active/Aktif
```

---

## 🎉 Test Zamanı!

DNS ve SSL aktif olduğunda:

```
1. Browser'ı aç
2. https://cınarcrm.online
3. ✅ Site açılmalı
4. 🔒 HTTPS (yeşil kilit) olmalı
5. Login test et
6. Dashboard kontrol et
```

---

## 📊 Özet Checklist

### DNS (Hostinger)
- [ ] A Record: @ → 72.60.178.139 (frontend için)
- [ ] A Record: backend → 72.60.178.139 (backend için)
- [ ] Kaydetme yapıldı
- [ ] 5-10 dakika beklendi
- [ ] nslookup ile doğrulandı

### Coolify
- [ ] Frontend domain eklendi: cınarcrm.online
- [ ] Backend domain eklendi: backend.cınarcrm.online
- [ ] SSL enabled (Let's Encrypt)
- [ ] Environment variables set edildi
- [ ] Build başarılı (✅ Running)

### Git
- [ ] Değişiklikler commit edildi
- [ ] Git push yapıldı
- [ ] Coolify otomatik deploy etti

### Test
- [ ] https://cınarcrm.online açılıyor
- [ ] SSL sertifikası geçerli (🔒)
- [ ] Login çalışıyor
- [ ] API çağrıları başarılı

---

## 🔧 Troubleshooting

### DNS çözümlenmiyorsa:
```
1. Hostinger DNS ayarlarını kontrol et
2. A Record'lar doğru mu?
3. IP: 72.60.178.139 olarak set edilmiş mi?
4. 15-20 dakika daha bekle
5. ipconfig /flushdns (Windows)
```

### SSL oluşturulmuyorsa:
```
1. DNS çalışıyor mu kontrol et (nslookup)
2. Coolify'da domain doğru mu?
3. 80 ve 443 portları açık mı?
4. Coolify logs'ı kontrol et
```

### Site açılmıyorsa:
```
1. Coolify deployment "Running" durumunda mı?
2. Build başarılı mı?
3. Environment variables doğru mu?
4. Browser cache temizle (CTRL+SHIFT+R)
```

---

## 📞 Şu Anda Yapın

1. **Hostinger → DNS Yönetimi**
   - A Record ekle: @ → 72.60.178.139
   - A Record ekle: backend → 72.60.178.139

2. **5-10 Dakika Bekle**
   - DNS propagation için

3. **Coolify → Domain Ekle**
   - Frontend: cınarcrm.online
   - Backend: backend.cınarcrm.online

4. **Test Et!**
   - https://cınarcrm.online

Bu adımlardan sonra site canlıda olacak! 🚀

