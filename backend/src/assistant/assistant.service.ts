import { Injectable } from '@nestjs/common';

interface FaqEntry {
    keywords: string[];
    answer: string;
}

const FAQ: FaqEntry[] = [

    // ─────────────────────────────────────────────────────────
    // SİSTEM GENEL / KİMLİK
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['sistem nedir', 'çınar crm', 'iar crm', 'crm nedir', 'ne işe yarar', 'program nedir', 'uygulama ne', 'hakkında', 'genel bakış', 'açıkhava', 'erp nedir'],
        answer: '🏢 **Çınar CRM Nedir?**\n\nÇınar CRM; İzmir Açık Hava Reklam (IAR) tarafından kullanılan kapsamlı bir **ERP/CRM sistemidir**.\n\n**Ne yapar?**\n- Billboard, Megalight, CLP gibi reklam mecralarının yönetimi\n- Müşteri rezervasyon ve planlama takibi\n- Müşteri ilişkileri yönetimi (CRM)\n- Teklif, sözleşme ve fatura süreçleri\n- Satış ve doluluk raporları\n\nSol menüden tüm modüllere erişebilirsiniz.',
    },
    {
        keywords: ['modüller', 'sayfalar', 'menü', 'ne var sistemde', 'özellikler', 'neler var', 'modül listesi'],
        answer: '📋 **Sistem Modülleri:**\n\n🏠 **Genel Bakış** — Anlık özet, istatistikler, grafikler\n💼 **Satış** — Müşteri ve teklif yönetimi\n📅 **Rezervasyon** — Takvim bazlı mecra rezervasyonu\n📐 **Maliyet Ayarları** — Fiyat listeleri ve tarife yönetimi\n🗺️ **Envanter** — Reklam konumları (BB, MG, CLP)\n⚙️ **Operasyonlar** — Montaj/demontaj ve sahaya çıkış\n📄 **Teklifler** — PDF teklif hazırlama ve gönderme\n📝 **Sözleşmeler** — Dijital sözleşme yönetimi\n📞 **Arayan Firmalar** — Gelen çağrı kaydı\n📊 **Raporlar** — Yönetici analizleri (Admin)\n⚙️ **Ayarlar** — Hesap ve sistem yönetimi',
    },
    {
        keywords: ['teknoloji', 'tech stack', 'altyapı', 'hangi teknoloji', 'react', 'nestjs', 'supabase', 'postgresql'],
        answer: '⚙️ **Teknoloji Altyapısı:**\n\n**Frontend:**\n- React 18 + TypeScript (Vite)\n- Tailwind CSS (tasarım)\n- TanStack Query + Zustand (state)\n- React Hook Form + Zod (form doğrulama)\n- Recharts (grafikler)\n\n**Backend:**\n- NestJS (Node.js)\n- Prisma ORM\n- PostgreSQL — Supabase üzerinde\n- JWT + Passport.js (kimlik doğrulama)\n- Nodemailer (e-posta)\n- NestJS Schedule (cron joblar)\n- PDFKit (PDF oluşturma)\n- XLSX (Excel import/export)',
    },
    {
        keywords: ['mimari', 'architecture', 'client server', 'api', 'restful', 'nasıl çalışır sistem'],
        answer: '🏗️ **Sistem Mimarisi:**\n\nSistem üç katmanlı **Client-Server** mimarisiyle çalışır:\n\n1. **Frontend (React)** — Kullanıcı arayüzü, API\'dan gelen verileri görselleştirir\n2. **Backend (NestJS)** — RESTful API, iş mantığı, Prisma ile veritabanı işlemleri\n3. **Veritabanı (PostgreSQL/Supabase)** — İlişkisel veri yapısı\n\nFrontend → Backend\'e JWT token\'lı istekler gönderir → Backend veritabanından veriyi çekip döner.',
    },

    // ─────────────────────────────────────────────────────────
    // KİMLİK DOĞRULAMA / GÜVENLİK
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['giriş', 'login', 'oturum', 'şifre', 'kullanıcı adı', 'nasıl giriş', 'jwt', 'token', 'kimlik doğrulama', 'auth'],
        answer: '🔐 **Kimlik Doğrulama:**\n\nSisteme e-posta ve şifre ile giriş yapılır.\n\n**Süreç:**\n1. Kullanıcı e-posta + şifre girer\n2. Backend doğrular → **JWT token** üretilir\n3. Token, sonraki tüm API isteklerinde `Authorization` header\'ı ile gönderilir\n4. Token süresi (7 gün) dolunca yeniden giriş gerekir\n\n**Güvenlik:**\n- Role-based Access Control (RBAC) uygulanır\n- Her kullanıcı yalnızca kendi yetki alanındaki verilere erişebilir',
    },
    {
        keywords: ['yetki', 'rol', 'admin', 'yönetici', 'çalışan', 'izin', 'erişim', 'rbac', 'role'],
        answer: '🔑 **Yetki Seviyeleri (RBAC):**\n\n- **ADMIN**: Tüm modüller — Raporlar, Ayarlar, Kullanıcı yönetimi dahil\n- **MANAGER / Yönetici**: Tüm modüller + Raporlar\n- **SALES / Çalışan**: Dashboard, Satış, Rezervasyon, Envanter, Operasyonlar, Teklifler, Arayan Firmalar\n\nYönetici, belirli sayfaları çalışanlara özel olarak açabilir. Yetki değişikliği için **Ayarlar → Kullanıcılar** (Admin gerektirir).',
    },

    // ─────────────────────────────────────────────────────────
    // VERİ MODELİ
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['veri modeli', 'veritabanı', 'şema', 'tablo', 'prisma', 'database', 'model'],
        answer: '🗄️ **Veri Modeli (Veritabanı Şeması):**\n\nVeritabanı 10 ana kategoride organize edilmiştir:\n\n👤 **User** — Kullanıcılar, roller, yetki bilgileri\n🏢 **Client / Contact / Communication** — Müşteri kartları, kontak kişiler, iletişim geçmişi\n📁 **Project / Task** — Kampanya projeleri ve görev takibi\n🗺️ **InventoryItem / Product** — Mecra tanımları (BB, MG, CLP)\n📅 **Booking** — Rezervasyon kayıtları\n💰 **Proposal / Invoice / Contract / PriceList** — Finans belgeleri ve fiyat listeleri',
    },
    {
        keywords: ['fiyat listesi', 'pricelist', 'periyot', 'yıllık fiyat', 'birim fiyat', 'tarife'],
        answer: '💰 **Fiyat Listesi (PriceList):**\n\nÜrün ve mecraların yıllara ve periyotlara göre birim fiyatları **PriceList** modülüyle yönetilir.\n\n- Her mecra tipi (BB, CLP, MG) için ayrı fiyat tanımlanabilir\n- Sezonluk fiyat değişkenlikleri desteklenir\n- Teklif hazırlanırken bu fiyatlar otomatik uygulanır\n- **Maliyet Ayarları** sayfasından güncellenir',
    },

    // ─────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['dashboard', 'genel bakış', 'ana sayfa', 'özet', 'istatistik', 'kpi', 'grafik', 'doluluk'],
        answer: '🏠 **Genel Bakış (Dashboard):**\n\nSisteme giriş yapınca açılan ilk sayfadır. Gerçek zamanlı veriler sunar:\n\n- Toplam aktif rezervasyon sayısı ve doluluk oranı\n- Toplam müşteri ve aktif proje sayısı\n- Aylık / yıllık gelir grafikleri (Recharts)\n- Son eklenen rezervasyonlar ve teklifler\n- Yaklaşan bitiş tarihleri uyarısı\n- Satış performansı ve dönemsel karşılaştırmalar\n\nYalnızca yöneticiler tüm istatistiklere erişebilir.',
    },

    // ─────────────────────────────────────────────────────────
    // ENVANTER / MECRALAR
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['envanter', 'mecra', 'pano', 'konum', 'lokasyon', 'billboard', 'megalight', 'clp', 'citylight', 'reklam alanı', 'stok'],
        answer: '🗺️ **Envanter (Mecra / Reklam Alanları):**\n\nTüm reklam mecralarının yönetildiği sayfadır.\n\n**Mecra tipleri:**\n- **BB** — Billboard (büyük yol kenarı pano)\n- **MG** — Megalight\n- **CLP** — City Light Poster (durak / yaya bölgesi)\n\n**Her mecra kaydında:**\n- Benzersiz kod (ör. BB0101, CLP0203)\n- İlçe, mahalle, tam adres\n- GPS koordinatları (harita görünümü için)\n- Network (ağ) bilgisi\n- Rota numarası\n- Aktif / Pasif durumu',
    },
    {
        keywords: ['konum ekle', 'mecra ekle', 'yeni konum', 'envantere ekle', 'pano ekle'],
        answer: '➕ **Yeni Mecra / Konum Eklemek:**\n\n1. **Envanter** sayfasına gidin\n2. "+" veya "Yeni Ekle" butonuna tıklayın\n3. Formu doldurun:\n   - Konum kodu (benzersiz, ör. BB0105)\n   - İlçe / Mahalle / Adres\n   - GPS koordinatları (harita için önemli!)\n   - Mecra tipi ve ağ bilgisi\n4. **Kaydet**\n\nEklenen mecra artık rezervasyon takviminde görünür hale gelir.',
    },
    {
        keywords: ['harita', 'koordinat', 'gps', 'map'],
        answer: '📍 **Harita Görünümü:**\n\nEnvanter sayfasında "Harita Görünümü" seçeneğiyle tüm mecralar GPS koordinatlarına göre harita üzerinde gösterilir.\n\nBu sayede:\n- Konumların fiziksel dağılımını görürsünüz\n- Belirli bir bölgedeki müsait mecralar tespit edilir\n- Müşteriye konum sunumu hazırlamak kolaylaşır\n\nKoordinatlar envanter kaydında `koordinatlar` alanına girilir.',
    },
    {
        keywords: ['excel', 'içe aktar', 'import', 'dışa aktar', 'export', 'xlsx', 'toplu yükleme'],
        answer: '📊 **Excel Entegrasyonu:**\n\nSistem büyük veri setleri için Excel import/export destekler:\n\n**İçe Aktarma (Import):**\n- Envanter listesi (yüzlerce mecra tek seferde)\n- Müşteri listesi\n- Fiyat listeleri\n\n**Dışa Aktarma (Export):**\n- Rezervasyon raporları\n- Müşteri listeleri\n- Finansal veriler\n\nXLSX kütüphanesi kullanılmaktadır. İlgili sayfalardaki "Excel İndir / Yükle" butonlarıyla erişilir.',
    },
    {
        keywords: ['arama', 'filtreleme', 'filtre', 'ilçe', 'semt', 'network', 'ağ', 'gelişmiş filtre'],
        answer: '🔍 **Arama ve Filtreleme:**\n\nBinlerce mecra arasında gelişmiş filtreleme yapılabilir:\n\n- **İlçe**: Konak, Bornova, Karşıyaka, Buca...\n- **Semt / Mahalle**: İlçe altındaki bölgeler\n- **Network (Ağ)**: BB, CLP, MG gibi mecra ağları\n- **Durum**: BOŞ, OPSİYON, KESİN\n- **Tarih Aralığı**: Belirli dönemdeki müsaitlik\n\nFiltreler kombine kullanılabilir; örneğin "Bornova ilçesindeki, Ocak ayında BOŞ olan CLP\'ler" gibi.',
    },

    // ─────────────────────────────────────────────────────────
    // REZERVASYON
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['rezervasyon nedir', 'booking nedir', 'opsiyon kesin', 'rezervasyon ne'],
        answer: '📅 **Rezervasyon Sistemi:**\n\nBir mecranın belirli tarihler arasında müşteriye tahsis edilmesidir.\n\n**Üç durumu vardır:**\n- ⚪ **BOŞ** — Mecra müsait, rezervasyon yok\n- 🟡 **OPSİYON** — Ön rezervasyon; müşteri talep etti, henüz kesinleşmedi\n- 🟢 **KESİN** — Onaylanmış rezervasyon, mecra ayrıldı\n\n**Tipik akış:**\nMüşteri talep → OPSİYON → Teklif → Onay → KESİN → Operasyon (montaj)',
    },
    {
        keywords: ['rezervasyon ekle', 'yeni rezervasyon', 'nasıl rezervasyon', 'rezervasyon oluştur', 'yer ayır', 'rezervasyon yöntem'],
        answer: '📅 **Rezervasyon Ekleme Yöntemleri:**\n\nSistemde 3 farklı rezervasyon ekleme yöntemi vardır:\n\n**1️⃣ Manuel Toplu Atama** (en yaygın)\n**2️⃣ Müşteri Talebi Üzerinden** (ops. kontrol)\n**3️⃣ Liste İçinden Hızlı Düzenleme** (tek satır)\n\nDetay için "toplu atama", "talep üzerinden rezervasyon" veya "hızlı düzenleme" diye sorabilirsiniz.',
    },
    {
        keywords: ['toplu atama', 'toplu rezervasyon', 'manuel atama', 'çoklu seçim', 'birden fazla konum'],
        answer: '📦 **Manuel Toplu Atama:**\n\nEn yaygın ve hızlı rezervasyon yöntemidir.\n\n1. **Rezervasyonlar** sayfasına gidin\n2. **Yıl, Ay ve Hafta** (Pazartesi başlangıçlı) filtrelerini seçin\n3. Listeden rezerve etmek istediğiniz satırları **kutucukları işaretleyerek** seçin\n4. Sağ üstte çıkan **"Toplu Atama"** butonuna tıklayın\n5. Açılan pencerede:\n   - **Ticari Ünvan**: Marka adını girin veya listeden seçin\n   - **Opsiyon Sırası**: 1. Opsiyon, 2. Opsiyon vb.\n6. **"Atamayı Yap"** butonuna basın\n\n✅ Sistem seçili tüm lokasyonlar için belirtilen markaya otomatik kayıt oluşturur.',
    },
    {
        keywords: ['talep üzerinden', 'ops kontrol', 'müşteri talebi işle', 'talebi onayla', 'talep atama', 'otomatik atama'],
        answer: '🎯 **Müşteri Talebi Üzerinden Rezervasyon:**\n\nSatış ekibinden gelen talepleri işlerken kullanılır.\n\n1. Rezervasyon sayfasındaki **"Talepler"** sekmesine geçin\n2. İlgili talebin yanındaki **"İşle"** (onay ikonu) butonuna basın\n3. Sistem talebin kriterlerine (Network, Tip, Adet) göre uygun lokasyonları otomatik filtreler\n4. **"Talebi Onayla ve Atama Yap"** butonuna basın\n\n✅ Sistem en uygun boş yerleri otomatik bulur ve markaya atar.',
    },
    {
        keywords: ['hızlı düzenleme', 'çift tıkla', 'satır düzenle', 'marka yaz', 'inline düzenleme', 'hücre düzenle'],
        answer: '✏️ **Liste İçinden Hızlı Düzenleme:**\n\nHaftalık liste görünümünde tek bir satırı hızlıca düzenleyebilirsiniz:\n\n1. İlgili satırdaki **Ticari Ünvan** sütununa (Marka 1, 2, 3 veya 4) **çift tıklayın**\n2. Marka adını manuel yazın\n3. **Enter** tuşuna basın veya hücreden çıkın\n\n✅ Sistem değişikliği anında veritabanına kaydeder.',
    },
    {
        keywords: ['rezervasyon güncelle', 'rezervasyon düzenle', 'durum değiştir', 'kesin yap', 'iptal', 'opsiyon kesin'],
        answer: '🔄 **Rezervasyon Güncelleme / İptal:**\n\n**Durumu KESİN\'e almak:**\n- Satır sonundaki menüden durumu **KESİN** olarak güncelleyin\n- Varsayılan durum OPSİYON\'dur\n\n**İptal etmek:**\n- Durumu **BOŞ** olarak güncelleyin → mecra yeniden müsait olur\n\n💡 KESİN rezervasyonu silmeden önce operasyon takibini de kontrol edin.',
    },
    {
        keywords: ['takvim', 'haftalık', 'hafta', 'dönem seç', 'ay seç', 'yıl seç', 'pazartesi', 'haftaya git'],
        answer: '📆 **Rezervasyon Takvimi ve Dönem Seçimi:**\n\nSistem **haftalık (Pazartesi-Pazar)** periyotlarla çalışır.\n\n**Filtreleme:**\n- **Yıl → Ay → Hafta** sırasıyla seçilerek dönem belirlenir\n- Hafta seçimi Pazartesi başlangıçlıdır\n\n**Gezinme:**\n- ◀ ▶ ok butonlarıyla haftalar arası geçiş\n- "Haftaya Git" ile belirli haftaya atlama\n\n⚠️ **Önemli:** Bir rezervasyon yalnızca seçili hafta için geçerlidir. Uzun süreli kampanyalar için her hafta ayrı atama yapılır.',
    },
    {
        keywords: ['bekleyen işler', 'bekleyen', 'talep listesi', 'yan panel', 'sağ panel', 'talepler sekmesi'],
        answer: '📋 **Bekleyen İşler / Talepler:**\n\nRezervasyon sayfasındaki **"Talepler"** sekmesinden veya sağ kenardaki panelden erişilir.\n\n- Gelen müşteri talepleri listelenir (Network, Tip, Adet kriterleri ile)\n- "İşle" butonuyla talep işleme alınır\n- Sistem kriterlere uyan boş lokasyonları otomatik filtreler\n- Onaylandığında markaya otomatik atama yapılır',
    },
    {
        keywords: ['müşterilerim', 'müşteri paneli', 'sol panel', 'sol kenar'],
        answer: '👥 **Müşterilerim Paneli:**\n\nRezervasyon sayfasının **sol kenarında** açılır.\n\n- Size atanmış veya takip ettiğiniz müşteriler listelenir\n- Müşteriye ait aktif rezervasyonlar hızlıca görüntülenir\n- Müşteri üzerine tıklayarak detay sayfasına geçilebilir',
    },
    {
        keywords: ['marka', 'marka adı', 'brand', 'opsiyon adı', 'ticari ünvan', 'brand option', 'birden fazla müşteri', 'opsiyon sırası'],
        answer: '🏷️ **Marka / Opsiyon Adları:**\n\nHer mecra için **4 farklı marka / opsiyon** girilebilir (Marka 1, 2, 3, 4).\n\n**Opsiyon sırası nedir?**\nAynı mekâna birden fazla firmadan talep geldiğinde hepsi farklı opsiyon sıralarına girilir:\n- 1. Opsiyon: En öncelikli marka\n- 2. Opsiyon: İkinci tercih\n- vb.\n\nHangisi kesinleşirse o marka **KESİN** duruma alınır, diğerleri temizlenir.',
    },
    {
        keywords: ['network filtresi', 'ağ filtresi', 'net 1', 'net 2', 'network seç'],
        answer: '🌐 **Network (Ağ) Filtresi:**\n\nToplu atama yapmadan önce Network filtresini kullanarak yalnızca belirli ağdaki mecraları görüntüleyebilirsiniz.\n\n- Net 1, Net 2 gibi ağları filtreleyin\n- Filtrelenmiş listeden toplu seçim yapın\n- Böylece yanlış ağa atama yapma riski azalır\n\nFiltre, rezervasyon sayfasının üst kısmındaki dropdown menüden seçilir.',
    },

    // ─────────────────────────────────────────────────────────
    // MÜŞTERİ / SATIŞ / CRM
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['satış', 'satış sayfası', 'satış nedir', 'sales', 'crm'],
        answer: '💼 **Satış Modülü (CRM):**\n\nMüşteri ilişkileri ve teklif yönetiminin merkezi sayfasıdır.\n\n**Yapabilecekleriniz:**\n- Yeni müşteri / firma kaydı oluşturma\n- Satış pipeline\'ı takip etme\n- Teklif hazırlama ve durumu izleme\n- Müşteri iletişim geçmişi\n- Hatırlatıcı ve not yönetimi\n\n**Pipeline aşamaları:**\nPotansiyel → İletişime Geçildi → Teklif Verildi → Kazanıldı / Kaybedildi',
    },
    {
        keywords: ['müşteri ekle', 'yeni müşteri', 'firma ekle', 'müşteri oluştur', 'kayıt'],
        answer: '👤 **Yeni Müşteri Eklemek:**\n\n1. **Satış** sayfasına gidin → "Yeni Müşteri"\n2. Formu doldurun:\n   - Firma adı (zorunlu)\n   - Ticaret unvanı, sektör\n   - Vergi dairesi / numarası\n   - Adres, telefon, e-posta, website\n   - Yetkili kişi adı ve unvanı\n   - Hesap sorumlusu (kullanıcı ataması)\n3. **Kaydet**\n\n📌 Kayıt sonrası sistem otomatik "Yeni Müşteri Eklendi" bildirimi oluşturur.',
    },
    {
        keywords: ['müşteri not', 'not ekle', 'hatırlatıcı', 'hatırlatıcı ekle', 'reminder'],
        answer: '📝 **Müşteri Notu ve Hatırlatıcı:**\n\nMüşteri, Müşteri Talebi veya Arayan Firma sayfalarına not eklenebilir.\n\n**Not özelliği:**\n- Serbest metin notu\n- Hatırlatıcı tarihi ve saati belirlenebilir\n- Tekrarlayan hatırlatıcı seçeneği\n\nBelirlenen tarih / saatte sistem otomatik **uygulama içi bildirim** oluşturur.',
    },
    {
        keywords: ['iletişim geçmişi', 'contact', 'communication', 'kontak', 'ilgili kişi'],
        answer: '📞 **İletişim Geçmişi:**\n\nMüşteri kartında tüm iletişim kayıtları tutulur:\n\n- Yapılan telefon görüşmeleri\n- Gönderilen / alınan e-postalar\n- Toplantı notları\n\nBu kayıtlar **Client → Contact → Communication** veri modeliyle ilişkilidir. Her iletişim, ilgili kontak kişiye bağlı olarak kaydedilir.',
    },
    {
        keywords: ['lead', 'potansiyel', 'aşama', 'pipeline', 'kaybedildi', 'kazanıldı', 'kayıp nedeni'],
        answer: '📊 **Satış Pipeline (Aşamalar):**\n\n1. **Potansiyel** — Yeni, henüz iletişim kurulmamış\n2. **İletişime Geçildi** — Görüşme yapıldı\n3. **Teklif Verildi** — Resmi teklif gönderildi\n4. **Kazanıldı** — Anlaşma sağlandı, sözleşme yapıldı\n5. **Kaybedildi** — Teklif reddedildi (kayıp nedeni not alınabilir)\n\nAşama değişikliği müşteri kartındaki durum menüsünden yapılır.',
    },

    // ─────────────────────────────────────────────────────────
    // TEKLİF
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['teklif nedir', 'proposal nedir', 'teklif ne', 'teklif içerik', 'teklif nasıl'],
        answer: '📄 **Teklif Nedir?**\n\nMüşteriye sunulan resmi fiyat ve mecra teklifini içeren belgedir. PDF olarak hazırlanır ve e-posta ile gönderilebilir.\n\n**Teklif içeriği:**\n- Müşteri bilgileri\n- Önerilen mecra konumları (BB, MG, CLP)\n- Başlangıç-bitiş tarihleri\n- Birim fiyat, operasyon bedeli, baskı bedeli (otomatik)\n- Vergi ve toplam tutar (otomatik hesaplanır)\n- Ödeme ve iptal şartları\n- Şirket logosu ve imza alanı\n\n**Teklif durumları:** TASLAK → GÖNDERİLDİ → ONAYLANDI / REDDEDİLDİ',
    },
    {
        keywords: ['teklif oluştur', 'yeni teklif', 'teklif hazırla', 'teklif ver', 'teklif adım', 'teklif süreci', 'teklif akış'],
        answer: '📄 **Teklif Oluşturma (Adım Adım):**\n\n**Adım 1 — Müşteri ve Başlık:**\n- Sol menü → Teklifler → "Yeni Teklif Oluştur"\n- Müşteriyi VKN (vergi no) ile arayın veya listeden seçin\n- Teklif başlığı girin (ör. "Haziran 2025 Raket Kampanyası")\n- Teklif tarihi ve geçerlilik süresi (varsayılan 15 gün)\n\n**Adım 2 — Mecra ve Ürün Seçimi:**\n- Envanter listesinden BB, MG veya CLP seçin\n- Sistem otomatik ekler: Birim Fiyat + Operasyon Bedeli + Baskı Bedeli\n- Adet ve süre (hafta/gün) girin → toplam gerçek zamanlı hesaplanır\n\n**Adım 3 — Şartlar ve Notlar:**\n- Ödeme koşulları ve iptal şartlarını düzenleyin\n- Standart IAR taslak metni hazır gelir\n\n**Adım 4 — Kayıt:**\n- "Teklifi Oluştur" → **TASLAK** olarak kaydedilir\n- "Gönder" butonuyla durum **GÖNDERİLDİ** olur\n\n💡 Teklif numarası otomatik oluşturulur.',
    },
    {
        keywords: ['operasyon bedeli', 'baskı bedeli', 'op bedeli', 'otomatik hesaplama', 'fiyat hesap', 'birim fiyat'],
        answer: '💰 **Otomatik Fiyat Hesaplama:**\n\nBir mecra teklif satırına eklendiğinde sistem 3 kalemi otomatik doldurur:\n\n- 📋 **Birim Fiyat**: Mecra tipine göre güncel liste fiyatı (PriceList\'ten çekilir)\n- 🔧 **OP. BEDELİ (Operasyon)**: Montaj ve saha operasyon giderleri\n- 🖨️ **BASKI BEDELİ**: Mecranın ölçülerine göre baskı maliyeti\n\nAdet ve süre (hafta/gün) girilince toplam tutar gerçek zamanlı güncellenir.',
    },
    {
        keywords: ['teklif gönder', 'teklif email', 'teklif mail', 'müşteriye gönder', 'pdf gönder', 'sent'],
        answer: '📧 **Teklif Gönderme:**\n\n1. Teklif listesindeki ✈️ (uçak) ikonuna tıklayın\n2. Durum otomatik **GÖNDERİLDİ (SENT)** olarak güncellenir\n3. E-posta göndermek için "E-posta Gönder" seçeneğini kullanın:\n   - Alıcı adresi\n   - Gönderici hesabı (Ali, Simge, Ayşe, Can veya Pazarlama)\n   - İsteğe bağlı mesaj\n4. Teklif PDF eki ile gönderilir',
    },
    {
        keywords: ['yer talebi', 'operasyon kontrol', 'ops bekliyor', 'ops kontrol', 'müsaitlik kontrol', 'mecra müsait'],
        answer: '🔍 **Yer Talebi (Operasyon Kontrolü):**\n\nGönderilen tekliflerde "Yer Talebi Oluştur" butonuna basarak operasyon ekibinden mecra müsaitlik kontrolü talep edebilirsiniz.\n\n**Rozet durumları:**\n- 🟡 **Ops. Bekliyor**: Kontrol henüz yapılmadı\n- 🟢 **Ops. Kontrol Etti**: Mecra müsait onaylandı\n\nBu rozeti teklif tablosundan takip edebilirsiniz.',
    },
    {
        keywords: ['teklif durumu', 'taslak', 'draft', 'gönderildi', 'teklif onayla', 'teklif reddet', 'onaylandı', 'reddedildi'],
        answer: '✅ **Teklif Durumları:**\n\n- 📝 **TASLAK (DRAFT)**: Oluşturuldu, henüz gönderilmedi\n- ✈️ **GÖNDERİLDİ (SENT)**: Müşteriye ulaştırıldı\n- ✅ **ONAYLANDI**: Müşteri kabul etti → Sözleşmeye dönüştürülebilir\n- ❌ **REDDEDİLDİ**: Müşteri kabul etmedi\n\nDurum değişikliği teklif listesindeki ilgili ikonlardan yapılır.',
    },
    {
        keywords: ['teklif şablon', 'şablon', 'sözleşme metni', 'standart metin', 'ödeme koşul', 'iptal şart'],
        answer: '📋 **Teklif Şablonları ve Yasal Metinler:**\n\n- Teklif sayfasındaki **"Şablonlar"** butonuyla standart IAR sözleşme metinlerine PDF olarak erişebilirsiniz\n- Yeni teklif oluştururken şartlar alanına standart IAR taslak metni otomatik yüklenir\n- Ödeme koşulları ve iptal şartlarını her teklif için özelleştirebilirsiniz',
    },

    // ─────────────────────────────────────────────────────────
    // SÖZLEŞME
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['sözleşme', 'kontrat', 'sözleşme oluştur', 'sözleşmeye dönüştür', 'imza', 'contract'],
        answer: '📝 **Sözleşme Yönetimi:**\n\nOnaylanan teklifler sözleşmeye dönüştürülür:\n\n1. Teklifler sayfasında onaylanan teklifi bulun\n2. "Sözleşmeye Dönüştür" seçeneğine tıklayın\n3. Sözleşme bilgilerini tamamlayın\n4. PDF olarak indirin veya e-posta ile gönderin\n\nTüm sözleşmeler **Sözleşmeler** sayfasında dijital arşivde saklanır.',
    },

    // ─────────────────────────────────────────────────────────
    // PROJE / KAMPANYA
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['proje', 'kampanya', 'project', 'proje nedir', 'görev', 'task'],
        answer: '📁 **Proje ve Kampanya Yönetimi:**\n\nBirden fazla mecrayı kapsayan reklam kampanyaları **Proje** olarak yönetilir.\n\n**Bir proje şunları içerir:**\n- Birden fazla mecra rezervasyonu\n- Bağlı görevler (Task), sorumlular ve zaman çizelgesi\n- Tek teklif ve sözleşme\n- Tüm konumların ortak takibi\n\nProjeler; müşteri detay sayfasından veya **Projeler** modülünden oluşturulur.',
    },

    // ─────────────────────────────────────────────────────────
    // OPERASYONLAR
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['operasyon', 'operasyonlar', 'montaj', 'demontaj', 'asım', 'asım listesi', 'saha', 'bakım', 'ekip'],
        answer: '⚙️ **Operasyonlar (Asım Listesi):**\n\nSahaya çıkacak ekiplerin iş listesini yönetir.\n\n**Kapsadığı işlemler:**\n- Yeni reklam montajı (görselin panoya yerleştirilmesi)\n- Dönem sonu demontaj (eski görselin sökülmesi)\n- Periyodik bakım ve temizlik\n- Hasar tespit ve onarım\n\n**Her operasyon kaydında:**\n- Mecra bilgisi\n- İşlem türü ve tarihi\n- Sorumlu ekip\n- Durum: Bekliyor / Devam Ediyor / Tamamlandı',
    },

    // ─────────────────────────────────────────────────────────
    // ARAYAN FİRMALAR
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['arayan firmalar', 'gelen arama', 'telefon', 'çağrı kaydı', 'arama kaydı', 'incoming'],
        answer: '📞 **Arayan Firmalar:**\n\nTelefon ile arayıp bilgi alan veya talep bildiren firmaların kaydının tutulduğu sayfadır.\n\n**Kayıt içeriği:**\n- Firma adı ve arayan kişi\n- Telefon numarası ve tarih/saat\n- Talep detayı / görüşme notu\n- Takip hatırlatıcısı\n\n**Müşteriye dönüştürme:**\n"Müşteri Oluştur" butonuyla Satış modülüne aktarılır.',
    },

    // ─────────────────────────────────────────────────────────
    // BİLDİRİMLER
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['bildirim', 'zil', 'alarm', 'uyarı', 'notification'],
        answer: '🔔 **Bildirimler:**\n\nSağ üst köşedeki **zil ikonuyla** bildirimler paneli açılır.\n\n**Otomatik bildirim oluşturan olaylar:**\n- Yeni müşteri kaydı\n- Yeni rezervasyon talebi\n- Hatırlatıcı tarihi geldiğinde\n- Rezervasyon bitiş tarihi 3 gün kala\n\nBildirimler okundu işaretlenebilir veya silinebilir. Sağ üstteki kırmızı nokta okunmamış bildirim olduğunu gösterir.',
    },

    // ─────────────────────────────────────────────────────────
    // E-POSTA SİSTEMİ
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['e-posta', 'mail', 'email', 'otomatik mail', 'gönderici', 'nodemailer', 'smtp', 'yandex'],
        answer: '📧 **E-posta Sistemi:**\n\nSistem **Nodemailer** + **Yandex SMTP** altyapısını kullanır.\n\n**Tanımlı gönderici hesaplar:**\n- pazarlama@izmiracikhavareklam.com\n- ali@izmiracikhavareklam.com\n- simge@izmiracikhavareklam.com\n- ayse@izmiracikhavareklam.com\n- can@izmiracikhavareklam.com\n- **rezervasyon@izmiracikhavareklam.com** (otomatik bildirimler)\n\n**Gönderilen e-postalar:**\n- Rezervasyon bitiş hatırlatması (otomatik, 3 gün öncesi)\n- Teklif PDF gönderimi (elle tetiklenir)\n- Yeni kullanıcı hoşgeldin e-postası',
    },
    {
        keywords: ['rezervasyon bitiş', '3 gün', 'bitiş bildirimi', 'otomatik bildirim', 'hatırlatma maili', 'cron', 'zamanlanmış'],
        answer: '⏰ **Otomatik Rezervasyon Bitiş Bildirimi:**\n\nSistem **NestJS Schedule (cron)** ile her gün **saat 09:00\'da** (İstanbul saati) otomatik çalışır.\n\n**Süreç:**\n1. Bitiş tarihi 3 gün kalan KESİN ve OPSİYON rezervasyonlar tespit edilir\n2. **rezervasyon@izmiracikhavareklam.com** adresine HTML bildirim maili gönderilir\n3. Müşterinin e-postası kayıtlıysa ona da gönderilir\n\n**Mail içeriği:**\nFirma adı, mecra konumu, başlangıç/bitiş tarihleri, rezervasyon durumu.\n\n💡 Manuel tetiklemek için: `POST /api/booking-reminders/check`',
    },

    // ─────────────────────────────────────────────────────────
    // RAPORLAR
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['rapor', 'raporlar', 'analiz', 'istatistik', 'gelir raporu', 'satış raporu', 'doluluk oranı'],
        answer: '📊 **Raporlar (Yalnızca Admin / Yönetici):**\n\n**Mevcut raporlar:**\n- Dönemsel satış analizi\n- Mecra doluluk oranları (ağ ve ilçe bazında)\n- Gelir dağılımı grafikleri\n- Müşteri bazında harcama analizi\n- Aylık / yıllık karşılaştırma\n\nRaporlar Excel veya PDF olarak dışa aktarılabilir.\n\n⚠️ Bu sayfa yalnızca ADMIN ve MANAGER rolündeki kullanıcılara açıktır.',
    },

    // ─────────────────────────────────────────────────────────
    // AYARLAR
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['ayarlar', 'şifre değiştir', 'hesap', 'profil', 'kullanıcı yönetimi', 'settings'],
        answer: '⚙️ **Ayarlar:**\n\n**Tüm kullanıcılar:**\n- Şifre değiştirme\n- Kişisel bilgileri güncelleme\n\n**Yalnızca Admin:**\n- Yeni kullanıcı ekleme\n- Kullanıcı yetki / rol düzenleme\n- Modül erişim izinleri\n- Sistem geneli tercihler',
    },

    // ─────────────────────────────────────────────────────────
    // YARDIM
    // ─────────────────────────────────────────────────────────
    {
        keywords: ['yardım', 'destek', 'sorun', 'hata', 'çalışmıyor', 'sorun var', 'bug'],
        answer: '🆘 **Yardım ve Sorun Giderme:**\n\n1. Sayfayı yenileyin (F5)\n2. Tarayıcı önbelleğini temizleyin (Ctrl+Shift+Delete)\n3. Farklı bir tarayıcıda deneyin\n4. Oturumu kapatıp tekrar giriş yapın\n\nSorun devam ederse sistem yöneticinize bildirin.\n\nBu asistana sistem kullanımı hakkında istediğiniz soruyu sorabilirsiniz.',
    },
    {
        keywords: ['responsive', 'mobil', 'telefon', 'tablet', 'akıllı telefon'],
        answer: '📱 **Mobil / Tablet Kullanımı:**\n\nSistem responsive tasarıma sahiptir; masaüstü, tablet ve mobil cihazlarda sorunsuz çalışır.\n\nTailwind CSS ile geliştirilmiş arayüz, ekran boyutuna göre otomatik uyum sağlar.',
    },
];

// ─────────────────────────────────────────────────────────
// Skor tabanlı eşleşme
// 1. Tam ifade eşleşmesi → yüksek puan (×2)
// 2. Sorgu kelimeleri anahtar kelimenin içinde geçiyorsa → kısmi puan
//    (Türkçe ekleri yakalar: "eklenir" → "ekle", "oluşturulur" → "oluştur")
// ─────────────────────────────────────────────────────────
function findBestMatch(query: string): FaqEntry | null {
    const q = query.toLowerCase().trim();
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);

    let bestScore = 0;
    let bestEntry: FaqEntry | null = null;

    for (const entry of FAQ) {
        let score = 0;
        for (const kw of entry.keywords) {
            if (q.includes(kw)) {
                // Tam ifade eşleşmesi — en yüksek puan
                score += kw.length * 2;
            } else {
                // Kelime bazlı kısmi eşleşme (Türkçe ek toleransı)
                for (const word of queryWords) {
                    if (kw.includes(word) || word.includes(kw)) {
                        score += word.length;
                    }
                }
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
        }
    }

    return bestScore >= 5 ? bestEntry : null;
}

@Injectable()
export class AssistantService {
    chat(messages: Array<{ role: 'user' | 'assistant'; content: string }>): string {
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        if (!lastUserMessage) return 'Nasıl yardımcı olabilirim?';

        const query = lastUserMessage.content.toLowerCase().trim();

        // Karşılama
        if (/^(merhaba|selam|hi|hey|hello|günaydın|iyi günler)/.test(query)) {
            return 'Merhaba! 👋 Ben Çınar, IAR CRM yardımcı asistanıyım.\n\nAşağıdaki konularda yardımcı olabilirim:\n\n📅 Rezervasyon işlemleri\n💼 Müşteri / Satış / CRM\n📄 Teklif ve Sözleşme\n🗺️ Envanter ve Mecra yönetimi\n📧 E-posta bildirimleri\n📊 Raporlar\n⚙️ Sistem ve teknoloji altyapısı\n\nNe öğrenmek istersiniz?';
        }

        const match = findBestMatch(query);
        if (match) return match.answer;

        return '🤔 Bu konuda net bir bilgim yok.\n\nŞu konularda soru sorabilirsiniz:\n- **Sistem / Mimari**: Çınar CRM nedir, teknoloji altyapısı\n- **Rezervasyon**: Ekleme, takvim, durum yönetimi\n- **Müşteri / Satış**: Pipeline, notlar, hatırlatıcı\n- **Teklif / Sözleşme**: Oluşturma, PDF, gönderme\n- **Envanter**: Mecra tipleri (BB, CLP, MG), harita, filtre\n- **E-posta**: Otomatik bildirimler, gönderici hesaplar\n- **Raporlar / Ayarlar / Operasyonlar**';
    }
}
