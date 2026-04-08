import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import supabase from '../config/supabase.config';

const SYSTEM_PROMPT = `Sen "Çınar" adında, İzmir Açık Hava Reklam (IAR) CRM sisteminin kıdemli operasyonel asistanısın. Tüm CRM modüllerini sular seller gibi bilirsin ve kullanıcının her sorusuna doğru, gerçek verilerle cevap verirsin.

═══════════════════════════════════════
IAR CRM SİSTEM REHBERİ
═══════════════════════════════════════

ŞİRKET: İzmir Açık Hava Reklam (IAR), İzmir'in en büyük açıkhava reklam ajanslarından biri. Billboard, raket (CLP), megalight, giant board gibi mecraları işletir.

MECRA TİPLERİ:
- BB  : Billboard (büyük cadde panoları)
- CLP : Raket / Citylight Poster (yaya tipi küçük panolar)
- MGL : Megalight (büyük aydınlatmalı panolar)
- GB  : Giant Board (dev cephe panoları)
- MB  : Megaboard (büyük yol panosu)
- KB  : Köprü Bandrolü
- BE  : Büyük Envanter (özel projeler)

REZERVASYON STATÜLERİ (bookings.status):
- CONFIRMED / KESIN / KESN  → Onaylanmış kesin rezervasyon
- OPTION                   → Opsiyonlu (ön rezervasyon, henüz kesinleşmemiş)
- CANCELLED                → İptal edilmiş
İş akışı: BOŞ → OPSİYON → KESİN → (yayın bitiminde) BOŞ

CRM MODÜLLERİ (Frontend sayfaları):
1. **Genel Bakış (Dashboard)** — Günlük operasyonel özet, KPI'lar.
2. **Rezervasyon** — bookings tablosu. Kesin & opsiyon rezervasyonları, tarih bazlı planlama.
3. **Satış (Sales)** — Aylık ciro, kazanılan/kaybedilen fırsatlar.
4. **Maliyet Ayarları** — Mecra başına maliyet kalemleri.
5. **Envanter** — inventory_items tablosu. Tüm reklam ünitelerinin ana listesi.
6. **Operasyonlar** — Saha işleri, baskı/asım/söküm görevleri.
7. **Teklifler (Proposals)** — proposals + proposal_items tabloları. Müşteriye gönderilen ticari teklifler.
8. **Arayan Firmalar (Incoming Calls)** — Potansiyel müşteri çağrı kayıtları.
9. **Müşteriler (Clients)** — clients tablosu. Müşteri ana kayıtları, lead aşamaları.
10. **Müşteri Talepleri (Customer Requests)** — customer_requests tablosu. Müşterinin istediği ürün/tarih/bütçe.
11. **Projeler / Görevler (Projects/Tasks)** — projects, tasks tabloları.
12. **Raporlar** — Haftalık özet, çalışan raporları, doluluk dağılımı.
13. **Bildirimler** — notifications tablosu.
14. **Ayarlar** — Kullanıcı ve sistem ayarları.

VERİ TABLOLARI:
- inventory_items (id, code, type, address, district, network, is_active)
- bookings (id, inventory_item_id, client_id, brand_name, start_date, end_date, status, network)
- clients (id, name, company_name, sector, lead_stage, status, phone, email, city, district)
- proposals (id, proposal_number, title, client_id, status, total, valid_until, created_at)
- customer_requests (id, request_number, client_id, product_type, quantity, start_date, end_date, status, priority)
- tasks (id, title, project_id, status, priority, due_date)
- projects (id, name, client_id, status, category)

═══════════════════════════════════════
TOOL (ARAÇ) KULLANIMI — EN ÖNEMLİ KISIM
═══════════════════════════════════════

KESİN KURALLAR:
1. Sayı, isim, kod, adres, tarih, statü gibi her somut bilgi MUTLAKA bir tool çağrısının sonucundan gelmelidir.
2. ASLA veri uydurma. ASLA "yaklaşık", "tahmini", "muhtemelen 40-50 civarı" gibi şeyler söyleme.
3. ASLA "teknik aksaklık var", "sisteme erişemiyorum", "operasyon ekibine sor" gibi bahaneler üretme. Doğru tool'u çağır.
4. Kullanıcının istediği bilgi için birden fazla tool çağırman gerekiyorsa hepsini çağır.
5. Tool sonuçlarını olduğu gibi (markdown tablo/liste formatında) aktar; sayıları yuvarlama veya değiştirme.
6. Tarih ifadeleri ("bu ay", "haftaya", "Mart") YYYY-MM-DD formatına çevir ve tool'a o şekilde ver.
7. Eğer tool'un sonucunda hata mesajı varsa, hatayı kullanıcıya açıkça söyle.
8. Eğer hiçbir tool kullanıcının sorusunu kapsamıyorsa, mevcut tool'ları açıkça listele ve en yakınını öner — UYDURMA.

TOOL SEÇİM REHBERİ:
- "Boş / müsait lokasyonlar" → get_empty_locations (gerekirse type/date)
- "Dolu lokasyonlar / kim hangi panoda" → get_filled_locations
- "Networkler / ağlar" → get_networks veya get_locations_by_network
- "Tüm rezervasyonlar / aktif rezervasyonlar" → get_reservation_tables
- "Şu tarih aralığında rezervasyonlar / Mart ayı / haftaya" → get_bookings_by_date_range
- "X müşterisinin rezervasyonları" → get_client_bookings
- "Müşteri listesi / kaç müşterimiz var / sektör bazlı" → get_clients_summary veya search_client
- "Müşteri talepleri / customer requests" → get_customer_requests
- "Teklifler / proposals / hangi teklif onaylandı" → get_proposals
- "Görevler / tasks / yapılacaklar" → get_tasks
- "Projeler" → get_projects
- "Envanter doluluk özeti / KPI / dashboard" → get_inventory_summary veya get_dashboard_stats
- "CRM nasıl kullanılır / şu sayfada ne var" → tool çağırma, yukarıdaki MODÜLLER listesini kullan

Yanıtlarını Türkçe, profesyonel, kısa ve veri odaklı yaz. Markdown formatını kullan.`;

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
        const emptyItems = allItems?.filter(i => !bookedIds.has(i.id)) || [];

        if (emptyItems.length === 0) return `${type || 'Tüm'} tiplerinde şu an boş lokasyon bulunmuyor.`;

        let res = `**Boş Lokasyonlar (${type || 'Tüm Tipler'})** - Toplam: ${emptyItems.length}\n\n`;
        emptyItems.slice(0, 50).forEach(i => {
            res += `- ${i.code} (${i.type}): ${i.district || ''} ${i.address || ''} [${i.network || ''}]\n`;
        });

        if (emptyItems.length > 50) res += `\n*Toplam ${emptyItems.length} boş lokasyondan ilk 50 tanesi gösteriliyor.*`;
        return res;
    }

    private async getReservationTables() {
        const today = new Date().toISOString();
        try {
            const { data: activeBookings, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    clients (name),
                    inventory_items (code, type, address, district)
                `)
                .gte('end_date', today)
                .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN'])
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) {
                this.logger.error('Error fetching reservation tables:', error.message);
                return `Hata oluştu: ${error.message}`;
            }

            if (!activeBookings || activeBookings.length === 0) return "Şu an aktif bir rezervasyon kaydı bulunmuyor.";

            const confirmed = activeBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'KESIN' || b.status === 'KESN');
            const option = activeBookings.filter(b => b.status === 'OPTION');

            const groupByClient = (bookings: any[]) => {
                const groups: Record<string, any[]> = {};
                bookings.forEach(b => {
                    const name = b.clients?.name || b.brand_name || 'Bilinmeyen Müşteri';
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
                        const item = b.inventory_items;
                        const start = b.start_date ? new Date(b.start_date).toLocaleDateString('tr-TR') : '?';
                        const end = b.end_date ? new Date(b.end_date).toLocaleDateString('tr-TR') : '?';
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
                        const item = b.inventory_items;
                        const start = b.start_date ? new Date(b.start_date).toLocaleDateString('tr-TR') : '?';
                        const end = b.end_date ? new Date(b.end_date).toLocaleDateString('tr-TR') : '?';
                        res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
                    });
                }
            }
            return res;
        } catch (e) {
            this.logger.error('Unexpected error in getReservationTables:', (e as Error).message);
            return `Hata oluştu: ${(e as Error).message}`;
        }
    }

    private async getClientBookings(clientName: string) {
        const today = new Date().toISOString();
        try {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    clients (name),
                    inventory_items (code, type, address, district)
                `)
                .gte('end_date', today)
                .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN'])
                .order('created_at', { ascending: false });

            if (error) {
                this.logger.error('Error fetching client bookings:', error.message);
                return `Hata oluştu: ${error.message}`;
            }

            if (!bookings || bookings.length === 0) return "Aktif rezervasyon bulunmuyor.";

            const searchLower = clientName.toLowerCase().trim();
            const matched = bookings.filter(b => {
                const clientNameFromDb = b.clients?.name || '';
                const brandName = b.brand_name || '';
                return clientNameFromDb.toLowerCase().includes(searchLower) || brandName.toLowerCase().includes(searchLower);
            });

            if (matched.length === 0) return `"${clientName}" adına ait aktif rezervasyon bulunamadı.`;

            const confirmed = matched.filter(b => b.status === 'CONFIRMED' || b.status === 'KESIN' || b.status === 'KESN');
            const option = matched.filter(b => b.status === 'OPTION');
            const displayClient = matched[0].clients?.name || matched[0].brand_name || clientName;

            let res = `**${displayClient}** — Aktif Rezervasyonları (Toplam: ${matched.length})\n\n`;

            if (confirmed.length > 0) {
                res += `**KESİN** (${confirmed.length} lokasyon):\n`;
                confirmed.forEach(b => {
                    const item = b.inventory_items;
                    const start = b.start_date ? new Date(b.start_date).toLocaleDateString('tr-TR') : '?';
                    const end = b.end_date ? new Date(b.end_date).toLocaleDateString('tr-TR') : '?';
                    res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
                });
            }

            if (option.length > 0) {
                res += `\n**OPSİYONLU** (${option.length} lokasyon):\n`;
                option.forEach(b => {
                    const item = b.inventory_items;
                    const start = b.start_date ? new Date(b.start_date).toLocaleDateString('tr-TR') : '?';
                    const end = b.end_date ? new Date(b.end_date).toLocaleDateString('tr-TR') : '?';
                    res += `  - ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} ${item?.address || ''} | ${start} - ${end}\n`;
                });
            }

            return res;
        } catch (e) {
            this.logger.error('Unexpected error in getClientBookings:', (e as Error).message);
            return `Hata oluştu: ${(e as Error).message}`;
        }
    }

    private async getFilledLocations(type?: string, network?: string) {
        let query = supabase.from('inventory_items').select('id, code, type, address, district, network').eq('is_active', true);
        if (type) query = query.eq('type', type.toUpperCase());
        if (network) query = query.ilike('network', `%${network}%`);
        const { data: allItems, error: itemError } = await query;
        if (itemError) return `Hata oluştu: ${itemError.message}`;

        const today = new Date().toISOString();
        const { data: activeBookings, error: bErr } = await supabase
            .from('bookings')
            .select(`inventory_item_id, status, start_date, end_date, brand_name, clients (name)`)
            .lte('start_date', today)
            .gte('end_date', today)
            .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN']);
        if (bErr) return `Hata oluştu: ${bErr.message}`;

        const bookingMap = new Map<string, any>();
        (activeBookings || []).forEach(b => {
            if (b.inventory_item_id) bookingMap.set(b.inventory_item_id, b);
        });

        const filled = (allItems || []).filter(i => bookingMap.has(i.id));
        if (filled.length === 0) {
            return `${type || 'Tüm'} ${network ? '(' + network + ') ' : ''}tipinde şu an dolu lokasyon bulunmuyor.`;
        }

        let res = `**Dolu Lokasyonlar${type ? ' (' + type + ')' : ''}${network ? ' [Network: ' + network + ']' : ''}** — Toplam: ${filled.length}\n\n`;
        filled.slice(0, 80).forEach(i => {
            const b: any = bookingMap.get(i.id);
            const cName = b?.clients?.name || b?.brand_name || 'Bilinmeyen';
            const status = (b?.status === 'OPTION') ? 'OPSİYON' : 'KESİN';
            const end = b?.end_date ? new Date(b.end_date).toLocaleDateString('tr-TR') : '?';
            res += `- ${i.code} (${i.type}) ${i.district || ''} ${i.address || ''} [${i.network || '-'}] → **${cName}** | ${status} | bitiş: ${end}\n`;
        });
        if (filled.length > 80) res += `\n*Toplam ${filled.length} kayıttan ilk 80 tanesi gösteriliyor.*`;
        return res;
    }

    private async getNetworks() {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('network, type')
            .eq('is_active', true);
        if (error) return `Hata oluştu: ${error.message}`;

        const map = new Map<string, { total: number; byType: Record<string, number> }>();
        (data || []).forEach(i => {
            const net = (i.network || '(Network atanmamış)').trim() || '(Network atanmamış)';
            if (!map.has(net)) map.set(net, { total: 0, byType: {} });
            const entry = map.get(net)!;
            entry.total += 1;
            entry.byType[i.type] = (entry.byType[i.type] || 0) + 1;
        });

        if (map.size === 0) return 'Hiç network bulunamadı.';

        const sorted = [...map.entries()].sort((a, b) => b[1].total - a[1].total);
        let res = `**Network Listesi** — Toplam: ${sorted.length}\n\n`;
        sorted.forEach(([name, info]) => {
            const breakdown = Object.entries(info.byType).map(([t, c]) => `${t}:${c}`).join(', ');
            res += `- **${name}** — ${info.total} lokasyon (${breakdown})\n`;
        });
        return res;
    }

    private async getLocationsByNetwork(network: string) {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('code, type, address, district, network')
            .eq('is_active', true)
            .ilike('network', `%${network}%`);
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return `"${network}" network'ünde lokasyon bulunamadı.`;

        let res = `**Network: ${network}** — Toplam: ${data.length}\n\n`;
        data.slice(0, 100).forEach(i => {
            res += `- ${i.code} (${i.type}) ${i.district || ''} ${i.address || ''} [${i.network}]\n`;
        });
        if (data.length > 100) res += `\n*Toplam ${data.length} kayıttan ilk 100 tanesi gösteriliyor.*`;
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

    private async getBookingsByDateRange(startDate: string, endDate: string, type?: string, status?: string) {
        try {
            let query = supabase
                .from('bookings')
                .select(`*, clients (name, company_name), inventory_items (code, type, address, district, network)`)
                .lte('start_date', endDate)
                .gte('end_date', startDate)
                .order('start_date', { ascending: true })
                .limit(300);

            if (status) {
                const statusUpper = status.toUpperCase();
                if (statusUpper === 'KESIN' || statusUpper === 'CONFIRMED') {
                    query = query.in('status', ['CONFIRMED', 'KESIN', 'KESN']);
                } else if (statusUpper === 'OPSIYON' || statusUpper === 'OPTION') {
                    query = query.eq('status', 'OPTION');
                } else {
                    query = query.eq('status', statusUpper);
                }
            } else {
                query = query.in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN']);
            }

            const { data, error } = await query;
            if (error) return `Hata oluştu: ${error.message}`;

            let filtered = data || [];
            if (type) {
                const t = type.toUpperCase();
                filtered = filtered.filter((b: any) => b.inventory_items?.type === t);
            }

            if (filtered.length === 0) {
                return `${startDate} – ${endDate} aralığında ${type ? type + ' tipinde ' : ''}rezervasyon bulunamadı.`;
            }

            const kesin = filtered.filter((b: any) => ['CONFIRMED', 'KESIN', 'KESN'].includes(b.status));
            const opsiyon = filtered.filter((b: any) => b.status === 'OPTION');

            let res = `**Rezervasyonlar (${startDate} – ${endDate})**${type ? ' [' + type + ']' : ''}\n`;
            res += `Toplam: ${filtered.length} | KESİN: ${kesin.length} | OPSİYON: ${opsiyon.length}\n\n`;

            const render = (list: any[]) => {
                let out = '';
                list.slice(0, 80).forEach((b: any) => {
                    const item = b.inventory_items;
                    const cName = b.clients?.name || b.clients?.company_name || b.brand_name || 'Bilinmeyen';
                    const s = b.start_date ? new Date(b.start_date).toLocaleDateString('tr-TR') : '?';
                    const e = b.end_date ? new Date(b.end_date).toLocaleDateString('tr-TR') : '?';
                    out += `- ${item?.code || '?'} (${item?.type || '?'}) ${item?.district || ''} → **${cName}** | ${s} – ${e}\n`;
                });
                return out;
            };

            if (kesin.length > 0) res += `**KESİN:**\n${render(kesin)}\n`;
            if (opsiyon.length > 0) res += `**OPSİYON:**\n${render(opsiyon)}\n`;
            if (filtered.length > 160) res += `\n*Toplam ${filtered.length} kayıttan ilk 160 tanesi gösteriliyor.*`;
            return res;
        } catch (e) {
            return `Hata oluştu: ${(e as Error).message}`;
        }
    }

    private async getEmptyByDateRange(startDate: string, endDate: string, type?: string) {
        let q = supabase.from('inventory_items').select('id, code, type, address, district, network').eq('is_active', true);
        if (type) q = q.eq('type', type.toUpperCase());
        const { data: items, error } = await q;
        if (error) return `Hata oluştu: ${error.message}`;

        const { data: bookings, error: be } = await supabase
            .from('bookings')
            .select('inventory_item_id')
            .lte('start_date', endDate)
            .gte('end_date', startDate)
            .in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN']);
        if (be) return `Hata oluştu: ${be.message}`;

        const booked = new Set((bookings || []).map(b => b.inventory_item_id).filter(Boolean));
        const empty = (items || []).filter(i => !booked.has(i.id));
        if (empty.length === 0) return `${startDate} – ${endDate} aralığında ${type || 'hiçbir'} tipte boş lokasyon yok.`;

        let res = `**${startDate} – ${endDate} arası BOŞ Lokasyonlar${type ? ' (' + type + ')' : ''}** — Toplam: ${empty.length}\n\n`;
        empty.slice(0, 80).forEach(i => {
            res += `- ${i.code} (${i.type}) ${i.district || ''} ${i.address || ''} [${i.network || '-'}]\n`;
        });
        if (empty.length > 80) res += `\n*Toplam ${empty.length} kayıttan ilk 80 gösteriliyor.*`;
        return res;
    }

    private async getClientsSummary(sector?: string, leadStage?: string) {
        let q = supabase.from('clients').select('id, name, company_name, sector, lead_stage, status, city, phone');
        if (sector) q = q.ilike('sector', `%${sector}%`);
        if (leadStage) q = q.eq('lead_stage', leadStage);
        const { data, error } = await q.limit(500);
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return 'Filtreye uyan müşteri bulunamadı.';

        const byStage: Record<string, number> = {};
        const bySector: Record<string, number> = {};
        data.forEach(c => {
            const st = c.lead_stage || '(belirsiz)';
            byStage[st] = (byStage[st] || 0) + 1;
            const sc = c.sector || '(sektörsüz)';
            bySector[sc] = (bySector[sc] || 0) + 1;
        });

        let res = `**Müşteri Özeti** — Toplam: ${data.length}\n\n`;
        res += `**Lead Aşaması Dağılımı:**\n`;
        Object.entries(byStage).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => res += `- ${k}: ${v}\n`);
        res += `\n**Sektör Dağılımı (ilk 10):**\n`;
        Object.entries(bySector).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) => res += `- ${k}: ${v}\n`);
        res += `\n**İlk 30 Müşteri:**\n`;
        data.slice(0, 30).forEach(c => {
            res += `- **${c.company_name || c.name}** | ${c.sector || '-'} | ${c.lead_stage || '-'} | ${c.city || '-'}\n`;
        });
        return res;
    }

    private async searchClient(query: string) {
        const { data, error } = await supabase
            .from('clients')
            .select('id, name, company_name, sector, lead_stage, status, phone, email, city, district, contact_person, contact_phone')
            .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,trade_name.ilike.%${query}%`)
            .limit(20);
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return `"${query}" için müşteri bulunamadı.`;

        let res = `**"${query}" Müşteri Arama Sonuçları** (${data.length})\n\n`;
        data.forEach(c => {
            res += `**${c.company_name || c.name}**\n`;
            res += `  - Sektör: ${c.sector || '-'} | Aşama: ${c.lead_stage || '-'} | Durum: ${c.status || '-'}\n`;
            res += `  - Şehir: ${c.city || '-'} ${c.district || ''}\n`;
            res += `  - İletişim: ${c.contact_person || '-'} ${c.contact_phone || c.phone || ''} ${c.email || ''}\n\n`;
        });
        return res;
    }

    private async getCustomerRequests(status?: string, priority?: string) {
        let q = supabase.from('customer_requests').select('*, clients (name, company_name)').order('created_at', { ascending: false }).limit(100);
        if (status) q = q.eq('status', status);
        if (priority) q = q.eq('priority', priority);
        const { data, error } = await q;
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return 'Filtreye uyan müşteri talebi yok.';

        let res = `**Müşteri Talepleri** — Toplam: ${data.length}\n\n`;
        data.slice(0, 40).forEach((r: any) => {
            const c = r.clients?.company_name || r.clients?.name || 'Bilinmeyen';
            const s = r.start_date ? new Date(r.start_date).toLocaleDateString('tr-TR') : '?';
            const e = r.end_date ? new Date(r.end_date).toLocaleDateString('tr-TR') : '?';
            res += `- **#${r.request_number || r.id.slice(0, 6)}** ${c} | ${r.product_type} ×${r.quantity || 1} | ${s} – ${e} | ${r.status} | ${r.priority}\n`;
        });
        if (data.length > 40) res += `\n*${data.length} kayıttan ilk 40 gösteriliyor.*`;
        return res;
    }

    private async getProposals(status?: string) {
        let q = supabase.from('proposals').select('*, clients (name, company_name)').order('created_at', { ascending: false }).limit(100);
        if (status) q = q.eq('status', status);
        const { data, error } = await q;
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return 'Teklif bulunamadı.';

        const totalSum = data.reduce((s: number, p: any) => s + (Number(p.total) || 0), 0);
        const byStatus: Record<string, number> = {};
        data.forEach((p: any) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

        let res = `**Teklifler** — Toplam: ${data.length} | Tutar: ${totalSum.toLocaleString('tr-TR')} ₺\n`;
        res += Object.entries(byStatus).map(([k, v]) => `${k}:${v}`).join(' | ') + '\n\n';
        data.slice(0, 30).forEach((p: any) => {
            const c = p.clients?.company_name || p.clients?.name || '-';
            const total = Number(p.total || 0).toLocaleString('tr-TR');
            const created = p.created_at ? new Date(p.created_at).toLocaleDateString('tr-TR') : '-';
            res += `- **${p.proposal_number || p.id.slice(0, 6)}** ${p.title || ''} | ${c} | ${total} ₺ | ${p.status} | ${created}\n`;
        });
        if (data.length > 30) res += `\n*${data.length} kayıttan ilk 30 gösteriliyor.*`;
        return res;
    }

    private async getTasks(status?: string) {
        let q = supabase.from('tasks').select('*, projects (name, client_id)').order('due_date', { ascending: true }).limit(100);
        if (status) q = q.eq('status', status);
        const { data, error } = await q;
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return 'Görev bulunamadı.';

        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        data.forEach((t: any) => {
            byStatus[t.status] = (byStatus[t.status] || 0) + 1;
            byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
        });

        let res = `**Görevler** — Toplam: ${data.length}\n`;
        res += `Statü: ` + Object.entries(byStatus).map(([k, v]) => `${k}:${v}`).join(' | ') + '\n';
        res += `Öncelik: ` + Object.entries(byPriority).map(([k, v]) => `${k}:${v}`).join(' | ') + '\n\n';
        data.slice(0, 30).forEach((t: any) => {
            const due = t.due_date ? new Date(t.due_date).toLocaleDateString('tr-TR') : '-';
            res += `- **${t.title}** | ${t.projects?.name || '-'} | ${t.status} | ${t.priority} | bitiş: ${due}\n`;
        });
        if (data.length > 30) res += `\n*${data.length} kayıttan ilk 30 gösteriliyor.*`;
        return res;
    }

    private async getProjects(status?: string) {
        let q = supabase.from('projects').select('*, clients (name, company_name)').order('created_at', { ascending: false }).limit(100);
        if (status) q = q.eq('status', status);
        const { data, error } = await q;
        if (error) return `Hata oluştu: ${error.message}`;
        if (!data || data.length === 0) return 'Proje bulunamadı.';

        let res = `**Projeler** — Toplam: ${data.length}\n\n`;
        data.slice(0, 30).forEach((p: any) => {
            const c = p.clients?.company_name || p.clients?.name || '-';
            res += `- **${p.name}** | ${c} | ${p.category || '-'} | ${p.status}\n`;
        });
        if (data.length > 30) res += `\n*${data.length} kayıttan ilk 30 gösteriliyor.*`;
        return res;
    }

    private async getDashboardStats() {
        try {
            const today = new Date().toISOString();
            const [invRes, bookRes, cliRes, propRes, reqRes] = await Promise.all([
                supabase.from('inventory_items').select('id, type, is_active'),
                supabase.from('bookings').select('id, status, inventory_item_id, start_date, end_date, total:bookings(id)').lte('start_date', today).gte('end_date', today).in('status', ['CONFIRMED', 'OPTION', 'KESIN', 'KESN']),
                supabase.from('clients').select('id, status, lead_stage'),
                supabase.from('proposals').select('id, status, total'),
                supabase.from('customer_requests').select('id, status'),
            ]);

            const items = (invRes.data || []).filter((i: any) => i.is_active);
            const bookings = bookRes.data || [];
            const bookedIds = new Set(bookings.map((b: any) => b.inventory_item_id).filter(Boolean));

            const types = ['BB', 'CLP', 'MGL', 'GB'];
            let res = `**📊 IAR CRM — Genel Durum**\n\n`;
            res += `**Envanter Doluluk:**\n`;
            types.forEach(t => {
                const tot = items.filter((i: any) => i.type === t).length;
                const ful = items.filter((i: any) => i.type === t && bookedIds.has(i.id)).length;
                const pct = tot > 0 ? Math.round((ful / tot) * 100) : 0;
                res += `- ${t}: ${ful}/${tot} (%${pct})\n`;
            });
            const totalAll = items.length;
            const totalFull = items.filter((i: any) => bookedIds.has(i.id)).length;
            res += `- **TOPLAM: ${totalFull}/${totalAll} (%${totalAll ? Math.round(totalFull / totalAll * 100) : 0})**\n\n`;

            const kesin = bookings.filter((b: any) => ['CONFIRMED', 'KESIN', 'KESN'].includes(b.status)).length;
            const opt = bookings.filter((b: any) => b.status === 'OPTION').length;
            res += `**Aktif Rezervasyon:** ${bookings.length} (KESİN: ${kesin}, OPSİYON: ${opt})\n\n`;

            const clients = cliRes.data || [];
            const activeC = clients.filter((c: any) => c.status === 'active').length;
            res += `**Müşteriler:** ${clients.length} (Aktif: ${activeC})\n\n`;

            const props = propRes.data || [];
            const propTotal = props.reduce((s: number, p: any) => s + (Number(p.total) || 0), 0);
            res += `**Teklifler:** ${props.length} | Toplam tutar: ${propTotal.toLocaleString('tr-TR')} ₺\n\n`;

            const reqs = reqRes.data || [];
            const pending = reqs.filter((r: any) => r.status === 'pending').length;
            res += `**Müşteri Talepleri:** ${reqs.length} (Bekleyen: ${pending})\n`;
            return res;
        } catch (e) {
            return `Hata oluştu: ${(e as Error).message}`;
        }
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
                    name: 'get_filled_locations',
                    description: 'Şu an DOLU (aktif rezervasyonu olan) lokasyonları getirir. Mecra tipi (BB/CLP/MGL/GB) ve/veya network adına göre filtrelenebilir. Her lokasyonun hangi müşteriye, hangi statüde ve ne zamana kadar ait olduğunu da döner.',
                    parameters: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', description: 'Mecra tipi: BB, CLP, GB, MGL. Boş bırakılırsa tüm tipler.', enum: ['BB', 'CLP', 'GB', 'MGL'] },
                            network: { type: 'string', description: 'İsteğe bağlı network adı (kısmi eşleşme).' }
                        },
                        required: []
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_networks',
                    description: 'Sistemdeki tüm networkleri (reklam ağlarını) lokasyon sayılarıyla birlikte listeler.',
                    parameters: { type: 'object', properties: {} }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_locations_by_network',
                    description: 'Belirli bir network adına ait tüm lokasyonları listeler.',
                    parameters: {
                        type: 'object',
                        properties: {
                            network: { type: 'string', description: 'Network adı (kısmi eşleşme yapılır).' }
                        },
                        required: ['network']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_inventory_summary',
                    description: 'Tüm mecraların (BB, CLP, GB, MGL) toplam, dolu ve boş lokasyon sayılarını doluluk oranlarıyla birlikte getirir.',
                    parameters: { type: 'object', properties: {} }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_bookings_by_date_range',
                    description: 'Belirli bir tarih aralığında çakışan tüm rezervasyonları getirir. Tarih bazlı sorular için (örn: "Mart ayı rezervasyonları", "haftaya kimler dolu", "15 Nisan – 30 Nisan") MUTLAKA bunu kullan. Tarihler YYYY-MM-DD formatında olmalı.',
                    parameters: {
                        type: 'object',
                        properties: {
                            start_date: { type: 'string', description: 'Başlangıç tarihi YYYY-MM-DD' },
                            end_date: { type: 'string', description: 'Bitiş tarihi YYYY-MM-DD' },
                            type: { type: 'string', description: 'Mecra tipi filtresi (BB, CLP, MGL, GB) — opsiyonel', enum: ['BB', 'CLP', 'GB', 'MGL'] },
                            status: { type: 'string', description: 'Statü filtresi: KESIN veya OPSIYON — opsiyonel', enum: ['KESIN', 'OPSIYON'] }
                        },
                        required: ['start_date', 'end_date']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_empty_by_date_range',
                    description: 'Belirli bir tarih aralığında BOŞ kalan lokasyonları getirir. Müşteri "Mayıs ayında hangi BB\'ler boş?" gibi sorduğunda kullan.',
                    parameters: {
                        type: 'object',
                        properties: {
                            start_date: { type: 'string', description: 'YYYY-MM-DD' },
                            end_date: { type: 'string', description: 'YYYY-MM-DD' },
                            type: { type: 'string', enum: ['BB', 'CLP', 'GB', 'MGL'] }
                        },
                        required: ['start_date', 'end_date']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_clients_summary',
                    description: 'Müşteri listesinin özetini ve dağılımını (sektör, lead aşaması) getirir. Sektör veya lead_stage ile filtrelenebilir.',
                    parameters: {
                        type: 'object',
                        properties: {
                            sector: { type: 'string', description: 'Sektör adı (kısmi eşleşme)' },
                            lead_stage: { type: 'string', description: 'Lead aşaması: new, contacted, qualified, proposal, won, lost' }
                        }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'search_client',
                    description: 'Müşterileri isim/şirket adı/marka ile arar ve detaylarını (iletişim, sektör, lead aşaması) döner.',
                    parameters: {
                        type: 'object',
                        properties: { query: { type: 'string', description: 'Aranacak müşteri/şirket adı' } },
                        required: ['query']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_customer_requests',
                    description: 'Müşteri taleplerini (customer_requests) listeler. Statü ve önceliğe göre filtrelenebilir.',
                    parameters: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled', 'checked_by_ops'] },
                            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }
                        }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_proposals',
                    description: 'Teklifleri (proposals) listeler ve tutar özeti verir. Statü ile filtrelenebilir.',
                    parameters: {
                        type: 'object',
                        properties: { status: { type: 'string', description: 'draft, sent, accepted, rejected, expired vb.' } }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_tasks',
                    description: 'Görevleri (tasks) listeler. Statü ile filtrelenebilir.',
                    parameters: {
                        type: 'object',
                        properties: { status: { type: 'string', description: 'todo, in_progress, done vb.' } }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_projects',
                    description: 'Projeleri listeler. Statü ile filtrelenebilir.',
                    parameters: {
                        type: 'object',
                        properties: { status: { type: 'string' } }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_dashboard_stats',
                    description: 'CRM\'in genel durumunu özet olarak getirir: envanter doluluk, aktif rezervasyon, müşteri sayısı, teklif tutarı, müşteri talebi adedi.',
                    parameters: { type: 'object', properties: {} }
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
                    model: 'anthropic/claude-sonnet-4.5',
                    max_tokens: 4096,
                    messages: apiMessages,
                    tools: tools,
                    tool_choice: 'auto',
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

            if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
                this.logger.log(`Model requested ${responseMessage.tool_calls.length} tool calls`);
                apiMessages.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const funcName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    let funcResult = '';

                    this.logger.log(`Executing tool: ${funcName} with args: ${JSON.stringify(args)}`);

                    if (funcName === 'get_empty_locations') {
                        funcResult = await this.getEmptyLocations(args.type);
                    } else if (funcName === 'get_reservation_tables') {
                        funcResult = await this.getReservationTables();
                    } else if (funcName === 'get_client_bookings') {
                        funcResult = await this.getClientBookings(args.client_name);
                    } else if (funcName === 'get_filled_locations') {
                        funcResult = await this.getFilledLocations(args.type, args.network);
                    } else if (funcName === 'get_networks') {
                        funcResult = await this.getNetworks();
                    } else if (funcName === 'get_locations_by_network') {
                        funcResult = await this.getLocationsByNetwork(args.network);
                    } else if (funcName === 'get_inventory_summary') {
                        funcResult = await this.getInventorySummary();
                    } else if (funcName === 'get_bookings_by_date_range') {
                        funcResult = await this.getBookingsByDateRange(args.start_date, args.end_date, args.type, args.status);
                    } else if (funcName === 'get_empty_by_date_range') {
                        funcResult = await this.getEmptyByDateRange(args.start_date, args.end_date, args.type);
                    } else if (funcName === 'get_clients_summary') {
                        funcResult = await this.getClientsSummary(args.sector, args.lead_stage);
                    } else if (funcName === 'search_client') {
                        funcResult = await this.searchClient(args.query);
                    } else if (funcName === 'get_customer_requests') {
                        funcResult = await this.getCustomerRequests(args.status, args.priority);
                    } else if (funcName === 'get_proposals') {
                        funcResult = await this.getProposals(args.status);
                    } else if (funcName === 'get_tasks') {
                        funcResult = await this.getTasks(args.status);
                    } else if (funcName === 'get_projects') {
                        funcResult = await this.getProjects(args.status);
                    } else if (funcName === 'get_dashboard_stats') {
                        funcResult = await this.getDashboardStats();
                    }

                    apiMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: funcName,
                        content: funcResult,
                    });
                }

                const secondResponse = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'anthropic/claude-sonnet-4.5',
                        max_tokens: 4096,
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
