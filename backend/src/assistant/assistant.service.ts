import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import supabase from '../config/supabase.config';

const SYSTEM_PROMPT = `Sen "Çınar" adında, İzmir Açık Hava Reklam (IAR) CRM sistemi için geliştirilmiş operasyonel yardımcı asistansın.
Görevin kullanıcılara sistemdeki **rezervasyon, lokasyon ve müşteri** verilerini sorgulayıp sunmaktır.

TEMEL KURALLAR:
- Türkçe yanıt ver
- Kısa, net ve kullanışlı cevaplar ver
- Emoji kullan ama abartma
- Araç (tool) kullanarak gerçek zamanlı veri çek ve sun
- Bilmediğin konularda "bu konuda kesin bilgim yok" de, uydurma

OPERASYONEL YETENEKLERİN:
1. **Boş Lokasyon Sorgulama**: BB, CLP, GB, MGL tipindeki müsait lokasyonları gösterebilirsin
2. **Rezervasyon Tablosu**: Tüm aktif (KESİN + OPSİYON) rezervasyonları listeleyebilirsin
3. **Müşteri Bazlı Sorgu**: Belirli bir müşteri ismine göre tüm kesin ve opsiyon lokasyonlarını gösterebilirsin
4. **Envanter Özeti**: Toplam ve boş lokasyon sayılarını mecra tipine göre gösterebilirsin

Kullanıcı "boş lokasyonlar", "rezervasyonlar", "müşteri ismi ile sorgu" gibi operasyonel sorular sorduğunda mutlaka araç kullan.

SİSTEM BİLGİSİ:
- Billboard (BB): Büyük yol kenarı pano
- Megalight (MGL): Işıklı büyük panel
- CLP: Durak/yaya bölgesi posterler
- Giant Board (GB): Dev pano
- Rezervasyon durumları: BOŞ → OPSİYON (ön rezervasyon) → KESİN (onaylanmış)`;

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
        let query = supabase.from('inventory_items').select('id, code, type, address, district, network').eq('is_active', true);
        if (type) {
            query = query.eq('type', type.toUpperCase());
        }
        const { data: allItems, error: itemError } = await query;

        if (itemError) return `Hata oluştu: ${itemError.message}`;

        const today = new Date().toISOString();
        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('inventory_item_id, status')
            .lte('start_date', today)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN']);

        const bookedIds = new Set(activeBookings?.map(b => b.inventory_item_id).filter(Boolean));
        const emptyItems = allItems?.filter(item => !bookedIds.has(item.id)) || [];

        if (emptyItems.length === 0) return "Tüm lokasyonlar dolu veya aktif lokasyon bulunamadı.";

        const byType: Record<string, typeof emptyItems> = {};
        emptyItems.forEach(item => {
            const t = item.type || 'DİĞER';
            if (!byType[t]) byType[t] = [];
            byType[t].push(item);
        });

        let res = `Toplam **${emptyItems.length}** boş/müsait lokasyon bulundu:\n\n`;
        for (const [t, items] of Object.entries(byType)) {
            res += `**${t}** (${items.length} adet):\n`;
            items.slice(0, 30).forEach(i => {
                res += `  - ${i.code} | ${i.district || ''} ${i.address || ''}\n`;
            });
            if (items.length > 30) res += `  ... ve ${items.length - 30} adet daha\n`;
            res += '\n';
        }
        return res;
    }

    private async getReservationTables() {
        const today = new Date().toISOString();
        const { data: activeBookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                status,
                start_date,
                end_date,
                brand_name,
                notes,
                clients (name),
                inventory_items (code, type, address, district)
            `)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN'])
            .order('status', { ascending: false })
            .order('start_date', { ascending: true })
            .limit(200);

        if (error) return `Hata oluştu: ${error.message}`;
        if (!activeBookings || activeBookings.length === 0) return "Şu an aktif rezervasyon bulunmuyor.";

        const confirmed = activeBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'KESIN' || b.status === 'KESN');
        const option = activeBookings.filter(b => b.status === 'OPTION');

        const groupByClient = (bookings: typeof activeBookings) => {
            const groups: Record<string, typeof activeBookings> = {};
            bookings.forEach(b => {
                const name = (b.clients as any)?.name || b.brand_name || 'Bilinmeyen';
                if (!groups[name]) groups[name] = [];
                groups[name].push(b);
            });
            return groups;
        };

        let res = `**Aktif Rezervasyon Özeti** (Toplam: ${activeBookings.length})\n`;
        res += `KESİN: ${confirmed.length} | OPSİYON: ${option.length}\n\n`;

        if (confirmed.length > 0) {
            res += `**KESİN REZERVASYONLAR:**\n`;
            const cg = groupByClient(confirmed);
            for (const [client, bookings] of Object.entries(cg)) {
                res += `\n**${client}** (${bookings.length} lokasyon):\n`;
                bookings.forEach(b => {
                    const item = b.inventory_items as any;
                    const start = new Date(b.start_date).toLocaleDateString('tr-TR');
                    const end = new Date(b.end_date).toLocaleDateString('tr-TR');
                    res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
                });
            }
        }

        if (option.length > 0) {
            res += `\n**OPSİYONLU REZERVASYONLAR:**\n`;
            const og = groupByClient(option);
            for (const [client, bookings] of Object.entries(og)) {
                res += `\n**${client}** (${bookings.length} lokasyon):\n`;
                bookings.forEach(b => {
                    const item = b.inventory_items as any;
                    const start = new Date(b.start_date).toLocaleDateString('tr-TR');
                    const end = new Date(b.end_date).toLocaleDateString('tr-TR');
                    res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
                });
            }
        }

        return res;
    }

    private async getClientBookings(clientName: string) {
        const today = new Date().toISOString();
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                status,
                start_date,
                end_date,
                brand_name,
                notes,
                clients (name),
                inventory_items (code, type, address, district)
            `)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN'])
            .order('status', { ascending: false })
            .order('start_date', { ascending: true });

        if (error) return `Hata oluştu: ${error.message}`;
        if (!bookings || bookings.length === 0) return "Aktif rezervasyon bulunmuyor.";

        const searchLower = clientName.toLowerCase().trim();
        const matched = bookings.filter(b => {
            const clientNameFromDb = (b.clients as any)?.name || '';
            const brandName = b.brand_name || '';
            return clientNameFromDb.toLowerCase().includes(searchLower) || brandName.toLowerCase().includes(searchLower);
        });

        if (matched.length === 0) return `"${clientName}" adına ait aktif rezervasyon bulunamadı.`;

        const confirmed = matched.filter(b => b.status === 'CONFIRMED' || b.status === 'KESIN' || b.status === 'KESN');
        const option = matched.filter(b => b.status === 'OPTION');
        const displayClient = (matched[0].clients as any)?.name || matched[0].brand_name || clientName;

        let res = `**${displayClient}** — Aktif Rezervasyonları (Toplam: ${matched.length})\n\n`;

        if (confirmed.length > 0) {
            res += `**KESİN** (${confirmed.length} lokasyon):\n`;
            confirmed.forEach(b => {
                const item = b.inventory_items as any;
                const start = new Date(b.start_date).toLocaleDateString('tr-TR');
                const end = new Date(b.end_date).toLocaleDateString('tr-TR');
                res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
            });
        }

        if (option.length > 0) {
            res += `\n**OPSİYONLU** (${option.length} lokasyon):\n`;
            option.forEach(b => {
                const item = b.inventory_items as any;
                const start = new Date(b.start_date).toLocaleDateString('tr-TR');
                const end = new Date(b.end_date).toLocaleDateString('tr-TR');
                res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
            });
        }

        return res;
    }

    private async getInventorySummary() {
        const { data: allItems, error } = await supabase
            .from('inventory_items')
            .select('id, code, type, is_active');

        if (error) return `Hata oluştu: ${error.message}`;

        const today = new Date().toISOString();
        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('inventory_item_id')
            .lte('start_date', today)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN']);

        const bookedIds = new Set(activeBookings?.map(b => b.inventory_item_id).filter(Boolean));
        const activeItems = allItems?.filter(i => i.is_active) || [];

        const types = ['BB', 'CLP', 'GB', 'MGL'];
        let res = `**Envanter Özeti**\n\n`;
        res += `| Mecra | Toplam | Dolu | Boş | Doluluk |\n`;
        res += `|-------|--------|------|-----|--------|\n`;

        let totalAll = 0, totalBooked = 0;
        for (const type of types) {
            const typed = activeItems.filter(i => i.type === type);
            const typedBooked = typed.filter(i => bookedIds.has(i.id));
            const typedEmpty = typed.length - typedBooked.length;
            const pct = typed.length > 0 ? Math.round((typedBooked.length / typed.length) * 100) : 0;
            res += `| ${type} | ${typed.length} | ${typedBooked.length} | ${typedEmpty} | %${pct} |\n`;
            totalAll += typed.length;
            totalBooked += typedBooked.length;
        }

        const totalPct = totalAll > 0 ? Math.round((totalBooked / totalAll) * 100) : 0;
        res += `| **TOPLAM** | **${totalAll}** | **${totalBooked}** | **${totalAll - totalBooked}** | **%${totalPct}** |\n`;

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
                    description: 'Belirli bir mecra tipi için boş/müsait lokasyonları getirir. Tüm boş lokasyonları görmek için type parametresi verilmeyebilir.',
                    parameters: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', description: 'Mecra tipi: BB, CLP, GB, MGL. Boş bırakılırsa tüm tipler gelir.', enum: ['BB', 'CLP', 'GB', 'MGL'] }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_reservation_tables',
                    description: 'Tüm aktif rezervasyonları (KESİN ve OPSİYON) müşteri ismine göre gruplayarak getirir.',
                    parameters: {
                        type: 'object',
                        properties: {}
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_client_bookings',
                    description: 'Belirli bir müşteri ismine ait tüm KESİN ve OPSİYON lokasyonlarını getirir. Müşteri adı veya marka adı ile arama yapar.',
                    parameters: {
                        type: 'object',
                        properties: {
                            client_name: { type: 'string', description: 'Müşteri adı veya marka adı (ör: "Sushitto", "Karşıyaka Belediyesi")' }
                        },
                        required: ['client_name']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_inventory_summary',
                    description: 'Tüm mecraların (BB, CLP, GB, MGL) toplam, dolu ve boş lokasyon sayılarını doluluk oranlarıyla birlikte getirir.',
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
                    model: 'anthropic/claude-3-haiku',
                    max_tokens: 2048,
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
                apiMessages.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const funcName = toolCall.function.name;
                    let funcResult = "";
                    try {
                        const args = JSON.parse(toolCall.function.arguments || "{}");
                        if (funcName === 'get_empty_locations') {
                            funcResult = await this.getEmptyLocations(args.type);
                        } else if (funcName === 'get_reservation_tables') {
                            funcResult = await this.getReservationTables();
                        } else if (funcName === 'get_client_bookings') {
                            funcResult = await this.getClientBookings(args.client_name);
                        } else if (funcName === 'get_inventory_summary') {
                            funcResult = await this.getInventorySummary();
                        } else {
                            funcResult = "Bilinmeyen fonksiyon.";
                        }
                    } catch (e) {
                        funcResult = "Fonksiyon çalıştırılırken hata oluştu: " + (e as Error).message;
                    }

                    apiMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: funcName,
                        content: funcResult
                    });
                }

                const secondResponse = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'anthropic/claude-3-haiku',
                        max_tokens: 2048,
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
            const errData = error?.response?.data || (error as Error).message;
            this.logger.error('OpenRouter API error:', JSON.stringify(errData));
            return 'Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.';
        }
    }
}
