import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import supabase from '../config/supabase.config';

const SYSTEM_PROMPT = `Sen "Çınar" adında, İzmir Açık Hava Reklam (IAR) CRM sistemi için geliştirilmiş bir yardımcı asistansın.
Görevin kullanıcılara sistem hakkında yardımcı olmak, sorularını yanıtlamak ve rehberlik etmektir.

TEMEL KURALLAR:
- Türkçe yanıt ver
- Kısa, net ve kullanışlı cevaplar ver
- Kullanıcıya adım adım rehberlik et
- Emoji kullan ama abartma
- Sistemle ilgili olmayan sorularda kibarca yönlendir
- Bilmediğin konularda "bu konuda kesin bilgim yok" de, uydurma

SİSTEM BİLGİSİ:

🏢 Çınar CRM; İzmir Açık Hava Reklam (IAR) tarafından kullanılan kapsamlı bir ERP/CRM sistemidir.
Billboard, Megalight, CLP gibi reklam mecralarının yönetimi, müşteri rezervasyon ve planlama takibi,
müşteri ilişkileri yönetimi (CRM), teklif, sözleşme ve fatura süreçleri, satış ve doluluk raporları gibi
tüm iş süreçlerini kapsar.

MODÜLLER:
🏠 Genel Bakış (Dashboard) — Anlık özet, istatistikler, grafikler, KPI'lar
💼 Satış — Müşteri ve teklif yönetimi, CRM, pipeline (Potansiyel → İletişime Geçildi → Teklif Verildi → Kazanıldı/Kaybedildi)
📅 Rezervasyon — Takvim bazlı mecra rezervasyonu (haftalık periyot, Pazartesi başlangıçlı)
📐 Maliyet Ayarları — Fiyat listeleri ve tarife yönetimi
🗺️ Envanter — Reklam konumları (BB=Billboard, MG=Megalight, CLP=City Light Poster)
⚙️ Operasyonlar — Montaj/demontaj, Asım Listesi, saha operasyonları
📄 Teklifler — PDF teklif hazırlama ve e-posta ile gönderme
📝 Sözleşmeler — Dijital sözleşme yönetimi
📞 Arayan Firmalar — Gelen çağrı kaydı ve takibi
📊 Raporlar — Yönetici analizleri (yalnızca Admin/Manager)
⚙️ Ayarlar — Hesap ve sistem yönetimi

TEKNOLOJİ ALTYAPISI:
- Frontend: React 18 + TypeScript (Vite), Tailwind CSS, TanStack Query + Zustand, React Hook Form + Zod, Recharts
- Backend: NestJS (Node.js), Prisma ORM, PostgreSQL (Supabase), JWT + Passport.js
- E-posta: Nodemailer + Yandex SMTP
- Diğer: NestJS Schedule (cron), PDFKit, XLSX

KİMLİK DOĞRULAMA VE YETKİLER:
- E-posta + şifre ile giriş, JWT token (7 gün süreli)
- RBAC (Role-Based Access Control):
  * ADMIN: Tüm modüller + Raporlar + Ayarlar + Kullanıcı yönetimi
  * MANAGER: Tüm modüller + Raporlar
  * SALES: Dashboard, Satış, Rezervasyon, Envanter, Operasyonlar, Teklifler, Arayan Firmalar

ENVANTER (MECRALAR):
- BB (Billboard): Büyük yol kenarı pano
- MG (Megalight): Işıklı büyük panel
- CLP (City Light Poster): Durak/yaya bölgesi posterler
- Her mecrada: benzersiz kod (ör. BB0101), ilçe, mahalle, adres, GPS koordinatları, network bilgisi, rota no, aktif/pasif durumu
- Gelişmiş filtreleme: ilçe, semt, network, durum, tarih aralığı
- Excel import/export desteklenir
- Harita görünümü (GPS koordinatları ile)

REZERVASYON SİSTEMİ:
- Durumlar: ⚪ BOŞ (müsait) → 🟡 OPSİYON (ön rezervasyon) → 🟢 KESİN (onaylanmış)
- Tipik akış: Müşteri talep → OPSİYON → Teklif → Onay → KESİN → Operasyon (montaj)
- Haftalık periyotlar (Pazartesi-Pazar), Yıl → Ay → Hafta filtresi
- 3 ekleme yöntemi:
  1. Manuel Toplu Atama: Satırları seçip "Toplu Atama" ile marka atama (en yaygın)
  2. Müşteri Talebi Üzerinden: Talepler sekmesinden otomatik uygun lokasyon bulma
  3. Hızlı Düzenleme: Listede çift tıklayıp marka yazma
- Her mecra için 4 opsiyon sırası (Marka 1-4), kesinleşen kalır diğerleri temizlenir
- Bekleyen İşler/Talepler paneli, Müşterilerim paneli (sol kenar)
- Network filtresi ile ağ bazlı görüntüleme

TEKLİF SİSTEMİ:
- Durumlar: TASLAK → GÖNDERİLDİ → ONAYLANDI / REDDEDİLDİ
- Otomatik fiyat hesaplama: Birim Fiyat + OP. Bedeli + Baskı Bedeli (PriceList'ten)
- Adımlar: Müşteri seç (VKN ile) → Mecra ekle → Şartları düzenle → Kaydet → Gönder
- PDF oluşturma ve e-posta ile gönderim
- Yer Talebi: Operasyon ekibinden müsaitlik kontrolü (Ops. Bekliyor → Ops. Kontrol Etti)
- Şablonlar ve standart IAR sözleşme metinleri

SÖZLEŞME: Onaylanan teklifler sözleşmeye dönüştürülür, PDF olarak indirilebilir/gönderilebilir.

E-POSTA SİSTEMİ:
- Yandex SMTP üzerinden 6 gönderici hesap
- Otomatik bildirim: Her gün saat 09:00'da bitiş tarihi 3 gün kalan rezervasyonlar için mail
- Teklif PDF gönderimi (elle tetiklenir)

RAPORLAR (Admin/Manager):
- Satış analizi, mecra doluluk oranları, gelir dağılımı, müşteri harcama analizi
- Aylık/yıllık karşılaştırma, Excel/PDF dışa aktarma

OPERASYONLAR (Asım Listesi):
- Montaj, demontaj, bakım, onarım iş listeleri
- Sorumlu ekip, durum takibi: Bekliyor → Devam Ediyor → Tamamlandı

BİLDİRİMLER:
- Sağ üst zil ikonu, okundu/okunmadı takibi
- Otomatik tetikleyiciler: yeni müşteri, yeni talep, hatırlatıcı, bitiş yaklaşma

YARDIM:
- Sayfa yenileme (F5), önbellek temizleme (Ctrl+Shift+Delete), farklı tarayıcı deneme
- Sistem responsive tasarıma sahip (mobil/tablet/masaüstü)`;

@Injectable()
export class AssistantService {
    private readonly logger = new Logger(AssistantService.name);
    private apiKey: string | null = null;

    constructor() {
        const apiKey = process.env.ZAI_API_KEY;
        if (apiKey) {
            this.apiKey = apiKey;
            this.logger.log('Z.ai API client initialized');
        } else {
            this.logger.warn('ZAI_API_KEY is not configured. AI assistant will use fallback mode.');
        }
    }

    private async getEmptyLocations(type?: string) {
        let query = supabase.from('inventory_items').select('code, type, address').eq('is_active', true);
        if (type) {
            query = query.eq('type', type);
        }
        const { data: allItems } = await query;
        
        const today = new Date().toISOString();
        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('inventory_items(code)')
            .lte('start_date', today)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION']);
            
        const bookedCodes = new Set(activeBookings?.map(b => (b.inventory_items as any)?.code).filter(Boolean));
        const emptyItems = allItems?.filter(item => !bookedCodes.has(item.code)) || [];
        
        if (emptyItems.length === 0) return "Hiç boş lokasyon bulunamadı.";
        
        let res = `Toplam ${emptyItems.length} boş lokasyon bulundu.\nÖrnek boş lokasyonlar (maksimum 20 adet gösteriliyor):\n`;
        res += emptyItems.slice(0, 20).map(i => `- ${i.code} (${i.type}): ${i.address}`).join('\n');
        return res;
    }

    private async getReservationTables() {
        const today = new Date().toISOString();
        const { data: activeBookings } = await supabase
            .from('bookings')
            .select(`
                status,
                start_date,
                end_date,
                clients(name),
                inventory_items(code, type)
            `)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION'])
            .order('created_at', { ascending: false })
            .limit(30);
            
        if (!activeBookings || activeBookings.length === 0) return "Şu an için aktif rezervasyon görünmüyor.";
        
        let res = "Güncel Aktif Rezervasyonlar Özeti (ilk 30):\n";
        res += activeBookings.map(b => `- ${b.status === 'CONFIRMED' ? 'KESİN' : 'OPSİYON'}: ${(b.clients as any)?.name} -> ${(b.inventory_items as any)?.code} (${(b.inventory_items as any)?.type})`).join('\n');
        return res;
    }

    async chat(messages: Array<any>): Promise<string> {
        if (!this.apiKey) {
            this.logger.warn('Chat called but no API key available');
            return 'Üzgünüm, AI asistanı henüz yapılandırılmadı. (API key eksik)';
        }

        const tools = [
            {
                type: 'function',
                function: {
                    name: 'get_empty_locations',
                    description: 'Belirli bir mecra tipi için boş/müsait lokasyonları getirir.',
                    parameters: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', description: 'Mecra tipi. Enum: BB, CLP, GB, MGL' }
                        }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_reservation_tables',
                    description: 'Mevcut rezervasyon durumlarını, tablolarını ve kimin neyi kiraladığını getirir.',
                    parameters: {
                        type: 'object',
                        properties: {}
                    }
                }
            }
        ];

        try {
            this.logger.log(`Sending request to OpenRouter API with ${messages.length} messages`);
            let apiMessages: any[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages.map(m => ({ role: m.role, content: m.content })),
            ];

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'anthropic/claude-3-haiku', // Fallback to a valid tool-supporting text model
                    max_tokens: 1024,
                    messages: apiMessages,
                    tools: tools,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                },
            );

            const responseMessage = response.data?.choices?.[0]?.message;
            if (!responseMessage) {
                return 'Yanıt oluşturulamadı. Lütfen tekrar deneyin.';
            }

            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                this.logger.log(`LLM requested tool calls: ${JSON.stringify(responseMessage.tool_calls)}`);
                apiMessages.push(responseMessage); // Add assistant's tool call message
                
                for (const toolCall of responseMessage.tool_calls) {
                    const funcName = toolCall.function.name;
                    let funcResult = "";
                    try {
                        const args = JSON.parse(toolCall.function.arguments || "{}");
                        if (funcName === 'get_empty_locations') {
                            funcResult = await this.getEmptyLocations(args.type);
                        } else if (funcName === 'get_reservation_tables') {
                            funcResult = await this.getReservationTables();
                        } else {
                            funcResult = "Bilinmeyen fonksiyon.";
                        }
                    } catch (e) {
                         funcResult = "Fonksiyon çalıştırılırken hata oluştu: " + e.message;
                    }

                    apiMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: funcName,
                        content: funcResult
                    });
                }

                // Second call with tool outputs
                const secondResponse = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'anthropic/claude-3-haiku',
                        max_tokens: 1024,
                        messages: apiMessages,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000,
                    },
                );
                
                return secondResponse.data?.choices?.[0]?.message?.content || 'Yanıt oluşturulamadı.';
            }

            return responseMessage.content;
        } catch (error) {
            const errData = error?.response?.data || error.message;
            this.logger.error('OpenRouter API error:', JSON.stringify(errData));
            
            // Temporary simple fallback if tool calls fail or model gives bad error format
            return `Üzgünüm, şu an yanıt veremiyorum. Şunu kontrol edebilirsiniz: Rezervasyon sayfası günceldir.`;
        }
    }
}
