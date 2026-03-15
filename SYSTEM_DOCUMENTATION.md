# Çınar CRM Sistem Dökümantasyonu

Bu döküman, İzmir Açık Hava Reklam (IAR) / Çınar CRM projesinin teknik mimarisini, veri yapısını ve çalışma prensiplerini detaylı bir şekilde açıklamaktadır.

## 1. Genel Bakış
Çınar CRM, reklam mecralarının (Billboard, Megalight, CLP vb.) yönetimi, rezervasyon takibi, müşteri ilişkileri (CRM) ve finansal süreçlerin (Teklif, Sözleşme, Fatura) dijital ortamda takip edilmesini sağlayan kapsamlı bir kurumsal kaynak planlama (ERP) çözümüdür.

## 2. Teknoloji Yığını (Tech Stack)

### Frontend
- **Framework:** React 18 (Vite ile yapılandırılmış)
- **Dil:** TypeScript
- **Stil Yönetimi:** Tailwind CSS (Modern ve responsive tasarım)
- **State Management & Data Fetching:** TanStack Query (React Query) ve Zustand
- **Navigasyon:** React Router Dom
- **İkon Seti:** Lucide React
- **Grafikler:** Recharts
- **Form Yönetimi:** React Hook Form & Zod (Validasyon)

### Backend
- **Framework:** NestJS (Node.js tabanlı, modüler mimari)
- **ORM:** Prisma (PostgreSQL ile uyumlu)
- **Veritabanı:** PostgreSQL (Supabase üzerinde barındırılıyor)
- **Kimlik Doğrulama:** JWT (JSON Web Token) & Passport.js
- **Dosya İşlemleri:** PDFKit (PDF oluşturma), XLSX (Excel okuma/yazma)
- **E-posta Servisi:** Nodemailer (SMTP entegrasyonu)
- **Zamanlanmış Görevler:** NestJS Schedule (Cron jobs)

## 3. Sistem Mimarisi

Sistem, modern bir **Client-Server** mimarisi üzerine kuruludur:

1.  **Sunucu Tarafı (Backend):** RESTful API sağlar. Prisma üzerinden veritabanı işlemlerini yönetir. İş mantığını (business logic) merkezi olarak kontrol eder.
2.  **İstemci Tarafı (Frontend):** Kullanıcı arayüzünü sunar. API'den gelen verileri görselleştirir ve kullanıcı etkileşimlerini yönetir.
3.  **Veritabanı Katmanı:** Supabase üzerinde çalışan PostgreSQL, ilişkisel veri yapısını korur.

## 4. Veri Modeli ve Veritabanı Şeması

Veritabanı şeması 10 ana kategoride toplanmıştır:

### A. Kullanıcı Yönetimi (`User`)
- Kullanıcıların kimlik bilgileri, rolleri (ADMIN, SALES, MANAGER vb.) ve sistem erişim yetkileri tutulur.

### B. Müşteri İlişkileri (`Client`, `Contact`, `Communication`)
- Müşteri kartları, ilgili kontak kişiler ve müşterilerle yapılan tüm iletişimlerin (mail, telefon, toplantı notu) kaydı tutulur.

### C. Proje ve Görev Yönetimi (`Project`, `Task`)
- Reklam kampanyaları "Proje" olarak tanımlanır. Bu projelere bağlı görevler, sorumlular ve zaman çizelgeleri takip edilir.

### D. Envanter Yönetimi (`InventoryItem`, `Product`)
- **Mecralar:** Billboard (BB), Megalight (MG), CLP (City Light Poster) gibi reklam alanlarının kodları, adresleri, koordinatları ve network bilgileri tutulur.

### E. Rezervasyon ve Planlama (`Booking`)
- Envanter öğelerinin hangi tarihler arasında hangi müşteri/proje için rezerve edildiği (OPSİYON veya KESİN) takip edilir.

### F. Finans (`Proposal`, `Invoice`, `Contract`, `PriceList`)
- Teklif hazırlama süreci (PDF formatında çıktı dahil), sözleşme yönetimi ve fatura takibi gerçekleştirilir.
- `PriceList` ile ürünlerin yıllara ve periyotlara göre birim fiyatları yönetilir.

## 5. Temel İş Akışları

### 5.1. Kimlik Doğrulama ve Güvenlik
- Kullanıcılar e-posta ve şifre ile giriş yapar.
- Başarılı girişte bir JWT token üretilir ve sonraki tüm API isteklerinde Authorization header'ı ile gönderilir.
- Role-based Access Control (RBAC) ile kullanıcıların sadece kendi yetki alanlarındaki verilere erişimi sağlanır.

### 5.2. Envanter ve Rezervasyon Süreci
1.  Sistemde kayıtlı olan reklam alanları (CLP, BB vb.) listelenir.
2.  Müşteri talebine göre belirli tarihler için uygunluk kontrolü yapılır.
3.  Uygun alanlar için "Opsiyon" veya "Kesin" rezervasyon oluşturulur.
4.  Rezervasyon bitişine yakın sistem otomatik hatırlatıcılar gönderebilir.

### 5.3. Teklif Oluşturma (Proposal)
1.  Müşteri seçilir.
2.  Envanterden veya genel hizmetlerden kalemler eklenir.
3.  Sistem otomatik olarak vergi ve toplam tutarları hesaplar.
4.  Teklif onaylandığında PDF olarak indirilebilir veya paylaşılabilir.

## 6. Öne Çıkan Özellikler
- **Responsive Tasarım:** Hem masaüstü hem de mobil cihazlarda sorunsuz çalışma.
- **Dinamik Raporlama:** Dashboard üzerinden satış grafikleri, doluluk oranları ve performans verilerinin takibi.
- **Excel Entegrasyonu:** Büyük veri setlerinin (envanter, müşteri listesi) Excel üzerinden içeri aktarılması veya dışarı aktarılması.
- **Hatırlatıcılar:** Rezervasyon ve görevlerle ilgili e-posta bildirimleri.
- **Arama ve Filtreleme:** Binlerce envanter öğesi arasında gelişmiş filtreleme (İlçe, Semt, Network, Durum vb.).

## 7. Dosya Yapısı

```text
/
├── backend/                # NestJS Uygulaması
│   ├── src/                # Kaynak kodlar
│   │   ├── auth/           # Yetkilendirme modülü
│   │   ├── inventory/      # Envanter yönetimi
│   │   ├── bookings/       # Rezervasyon yönetimi
│   │   ├── prisma/         # Veritabanı şeması ve client
│   │   └── ...             # Diğer iş modülleri
│   └── package.json        
├── frontend/               # Vite + React Uygulaması
│   ├── src/                # Kaynak kodlar
│   │   ├── components/     # Yeniden kullanılabilir UI bileşenleri
│   │   ├── pages/          # Sayfa görünümleri
│   │   ├── services/       # API servisleri (Axios)
│   │   └── ...
│   └── package.json
└── ...                     # Veri işleme scriptleri (Python/JS)
```

---
*Hazırlayan: Antigravity AI Coding Assistant*
*Tarih: 16 Mart 2026*
