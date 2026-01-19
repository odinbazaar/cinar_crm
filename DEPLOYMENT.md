# Çınar CRM - Canlıya Alma Rehberi

## 📁 Dosya Yapısı

```
/var/www/
├── cınar.online/                # Frontend (statik dosyalar)
│   └── dist/                     # npm run build çıktısı
└── backend.cınar.online/         # Backend (Node.js)
    ├── dist/                  # npm run build çıktısı
    ├── node_modules/
    ├── .env                   # Production env dosyası
    └── package.json
```

## 🔧 1. Hostinger VPS'e Bağlanma

```bash
ssh root@YOUR_VPS_IP
```

## 📦 2. Gerekli Paketlerin Kurulumu

```bash
# Node.js 20.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu (Node.js uygulama yöneticisi)
npm install -g pm2

# Nginx kurulumu
sudo apt-get install -y nginx

# Certbot (SSL) kurulumu
sudo apt-get install -y certbot python3-certbot-nginx
```

## 🚀 3. Frontend Yükleme

```bash
# Klasör oluştur
sudo mkdir -p /var/www/cınarcrm.online

# Yerel bilgisayardan dosyaları yükle (SCP ile)
# Yerel bilgisayarda çalıştır:
scp -r frontend/dist/* root@YOUR_VPS_IP:/var/www/cınarcrm.online/

# Veya FileZilla/WinSCP ile yükle
```

## 🔧 4. Backend Yükleme

```bash
# Klasör oluştur
sudo mkdir -p /var/www/backend.cınarcrm.online

# Yerel bilgisayardan dosyaları yükle
scp -r backend/dist root@YOUR_VPS_IP:/var/www/backend.cınarcrm.online/
scp backend/package.json root@YOUR_VPS_IP:/var/www/backend.cınarcrm.online/
scp backend/.env.production root@YOUR_VPS_IP:/var/www/backend.cınarcrm.online/.env

# Sunucuda dependencies kur
cd /var/www/backend.cınarcrm.online
npm install --production

# PM2 ile başlat
pm2 start dist/main.js --name cinar-backend
pm2 save
pm2 startup
```

## 🌐 5. Nginx Konfigürasyonu

### Frontend (cınarcrm.online)
```bash
sudo nano /etc/nginx/sites-available/cınarcrm.online
```

```nginx
server {
    listen 80;
    server_name cınarcrm.online www.cınarcrm.online;
    root /var/www/cınarcrm.online;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Backend (backend.cınarcrm.online)
```bash
sudo nano /etc/nginx/sites-available/backend.cınarcrm.online
```

```nginx
server {
    listen 80;
    server_name backend.cınarcrm.online;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Konfigürasyonları Aktif Et
```bash
sudo ln -s /etc/nginx/sites-available/cınarcrm.online /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/backend.cınarcrm.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 6. SSL Sertifikası (HTTPS)

```bash
sudo certbot --nginx -d cınarcrm.online -d www.cınarcrm.online
sudo certbot --nginx -d backend.cınarcrm.online
```

## ✅ 7. Test

- Frontend: https://cınarcrm.online
- Backend API: https://backend.cınarcrm.online/api

## 🔄 8. Güncellemeler İçin

```bash
# Frontend güncelleme
scp -r frontend/dist/* root@YOUR_VPS_IP:/var/www/cınarcrm.online/

# Backend güncelleme
scp -r backend/dist root@YOUR_VPS_IP:/var/www/backend.cınarcrm.online/
ssh root@YOUR_VPS_IP "cd /var/www/backend.cınarcrm.online && pm2 restart cinar-backend"
```

## 📝 Notlar

- **Supabase:** Veritabanı Supabase bulut üzerinde çalışıyor, VPS'te veritabanı kurulumuna gerek yok.
- **E-posta:** SMTP ayarları .env dosyasında tanımlı.
- **Kullanıcılar:** Sistem kullanıcıları zaten Supabase'de kayıtlı.

## 🔑 Giriş Bilgileri

| E-posta | Şifre | Rol |
|---------|-------|-----|
| ali@izmiracikhavareklam.com | Cinarcrm123! | Admin |
| ayse@izmiracikhavareklam.com | Cinarcrm123! | Employee |
| muhasebe@izmiracikhavareklam.com | Cinarcrm123! | Manager |
| info@izmiracikhavareklam.com | Cinarcrm123! | Admin |
| goknil@izmiracikhavareklam.com | Cinarcrm123! | Employee |
| simge@izmiracikhavareklam.com | Cinarcrm123! | Employee |
| can@izmiracikhavareklam.com | Cinarcrm123! | Employee |
| cihangir@izmiracikhavareklam.com | Cinarcrm123! | Employee |

