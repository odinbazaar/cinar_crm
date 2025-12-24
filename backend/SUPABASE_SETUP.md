# Supabase Backend Kurulum Rehberi

## 📋 Gerekli Bilgileri Toplama

### 1. Supabase Dashboard'dan Bilgileri Alın

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard/project/slanoowprgrcksfqrgak

2. **Database Connection String için**:
   - Sol menüden **Project Settings** (⚙️) → **Database** seçin
   - **Connection String** bölümünde **URI** formatını seçin
   - Connection string'i kopyalayın (şu formatta olacak):
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
     ```

3. **API Keys için**:
   - Sol menüden **Project Settings** (⚙️) → **API** seçin
   - **Project URL** kopyalayın (örn: `https://slanoowprgrcksfqrgak.supabase.co`)
   - **Project API keys** altında **anon public** key'i kopyalayın

## 🔧 Backend Yapılandırması

### 2. .env Dosyasını Güncelleyin

Backend klasöründeki `.env` dosyasını aşağıdaki gibi güncelleyin:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Supabase API (Frontend için)
SUPABASE_URL="https://slanoowprgrcksfqrgak.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Redis (Opsiyonel - şimdilik devre dışı bırakabilirsiniz)
# REDIS_HOST="localhost"
# REDIS_PORT=6379

# MongoDB (Opsiyonel - şimdilik devre dışı bırakabilirsiniz)
# MONGODB_URI="mongodb://localhost:27017/cinar_crm"

# App
PORT=3000
NODE_ENV=development
```

### 3. Prisma Schema'yı Güncelleyin

`prisma/schema.prisma` dosyasında datasource'u PostgreSQL'e çevirin:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🚀 Veritabanı Migration

### 4. Prisma Migration Çalıştırın

```bash
# Backend klasöründe
cd backend

# Prisma Client'ı yeniden oluştur
npx prisma generate

# Migration'ları oluştur ve uygula
npx prisma migrate dev --name init

# Veya sadece push (development için)
npx prisma db push
```

### 5. Veritabanını Kontrol Edin

```bash
# Prisma Studio ile veritabanını görüntüle
npx prisma studio
```

## 📦 Bağımlılıkları Kontrol Edin

### 6. Gerekli Paketlerin Kurulu Olduğundan Emin Olun

```bash
npm install @prisma/client prisma
```

## ▶️ Backend'i Çalıştırın

### 7. Development Modunda Başlatın

```bash
npm run start:dev
```

Backend şu adreste çalışacak: http://localhost:3000

## 🔍 Test Edin

### 8. API Endpoint'lerini Test Edin

```bash
# Health check
curl http://localhost:3000

# Auth endpoint (varsa)
curl http://localhost:3000/api/auth/login
```

## 📝 Notlar

- **SQLite'dan PostgreSQL'e Geçiş**: Mevcut schema PostgreSQL ile uyumlu olacak şekilde güncellenecek
- **Decimal Tipler**: PostgreSQL'de `@db.Decimal` annotation'ları kullanılabilir
- **Text Tipler**: PostgreSQL'de `@db.Text` annotation'ları kullanılabilir
- **UUID**: PostgreSQL native UUID desteği var

## 🐛 Sorun Giderme

### Migration Hataları
Eğer migration sırasında hata alırsanız:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Connection Hataları
- DATABASE_URL'in doğru olduğundan emin olun
- Supabase projesinin aktif olduğunu kontrol edin
- Firewall/güvenlik duvarı ayarlarını kontrol edin

### Port Çakışması
Eğer 3000 portu kullanılıyorsa, `.env` dosyasında PORT değerini değiştirin.
