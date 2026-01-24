import { Injectable } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { User, CreateUserDto, UpdateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    async findAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data as User[];
    }

    async findOne(id: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as User;
    }

    async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data as User;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // E-postaları her zaman küçük harf yapıyoruz (Tutarlılık için)
        const rawEmail = createUserDto.email.toLowerCase().trim();
        const loginEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@cinarcrm.com`;

        console.log('🚀 Syncing User:', loginEmail);

        let authUserId: string | null = null;

        // 1. Supabase Auth sisteminde bu kullanıcı var mı diye manuel listeden kontrol edelim
        // (listUsers bazen gecikmeli gelebilir veya limitli olabilir, bu yüzden daha kapsamlı bakıyoruz)
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

        if (!listError && listData?.users) {
            const found = listData.users.find(u => u.email?.toLowerCase() === loginEmail.toLowerCase());
            if (found) {
                console.log('✅ Found existing Auth user:', found.id);
                authUserId = found.id;

                // Bilgilerini ve şifresini de güncelleyelim (Sync/Update mantığı)
                await supabase.auth.admin.updateUserById(authUserId, {
                    password: createUserDto.password,
                    user_metadata: {
                        first_name: createUserDto.first_name,
                        last_name: createUserDto.last_name,
                        full_name: `${createUserDto.first_name} ${createUserDto.last_name}`
                    }
                });
            }
        }

        // 2. Eğer listede bulamadıysak, eklemeyi deneyelim
        if (!authUserId) {
            console.log('🆕 User not in list, trying to create...');
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: loginEmail,
                password: createUserDto.password,
                email_confirm: true,
                user_metadata: {
                    first_name: createUserDto.first_name,
                    last_name: createUserDto.last_name,
                    full_name: `${createUserDto.first_name} ${createUserDto.last_name}`
                }
            });

            if (authError) {
                // Eğer burada "already registered" hatası alırsak, listUsers'ın göremediği bir durum olabilir.
                // Bu durumda yetki bazlı bir sorun yoksa listeyi tekrar kontrol edemeyiz ama hatayı susturup 
                // DB tarafına geçmeye çalışabiliriz (Eğer ID'yi bir şekilde alabilseydik).
                // Şimdilik hatayı yakalayıp daha detaylı loglayalım.
                console.error('❌ Supabase Auth Create error:', authError);

                if (authError.message.includes('already') || authError.status === 422) {
                    // Son bir kez daha aramayı dene (belki o an oluştu)
                    const { data: retryList } = await supabase.auth.admin.listUsers();
                    const retryFound = retryList?.users.find(u => u.email?.toLowerCase() === loginEmail.toLowerCase());
                    if (retryFound) {
                        authUserId = retryFound.id;
                    } else {
                        throw new Error(`Giriş sistemi çakışması: ${authError.message}. Bu e-posta başka bir kullanıcı tarafından kullanılıyor olabilir.`);
                    }
                } else {
                    throw new Error(`Giriş sistemi kaydı başarısız: ${authError.message}`);
                }
            } else if (authData?.user) {
                authUserId = authData.user.id;
            }
        }

        if (!authUserId) {
            throw new Error('Kullanıcı kimliği oluşturulamadı.');
        }

        // 3. Veritabanı Tablosuna (public.users) Kaydet
        const userData: any = {
            id: authUserId,
            email: rawEmail, // Orijinal girişi (küçük harf halini) kaydediyoruz
            password_hash: hashedPassword,
            first_name: createUserDto.first_name,
            last_name: createUserDto.last_name,
            role: createUserDto.role,
            status: 'ACTIVE',
            permissions: (createUserDto as any).permissions || ['dashboard', 'sales', 'reservations', 'inventory', 'proposals', 'incoming-calls']
        };

        if (createUserDto.phone) userData.phone = createUserDto.phone;
        if (createUserDto.hourly_rate !== undefined) userData.hourly_rate = createUserDto.hourly_rate;

        console.log('💾 DB Upsert started for:', loginEmail);
        const { data: dbData, error: dbError } = await supabase
            .from('users')
            .upsert([userData], { onConflict: 'email' })
            .select()
            .single();

        if (dbError) {
            console.error('❌ DB error:', dbError);
            throw new Error(`Veritabanı senkronizasyonu başarısız: ${dbError.message}`);
        }

        console.log('✨ Success!');
        return dbData as User;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updateData: any = { ...updateUserDto };

        if (updateUserDto.password) {
            const { error: authError } = await supabase.auth.admin.updateUserById(id, {
                password: updateUserDto.password
            });

            if (authError) {
                console.error('❌ Auth update error:', authError);
                throw new Error(`Giriş sistemi şifre güncellemesi başarısız: ${authError.message}`);
            }

            updateData.password_hash = await bcrypt.hash(updateUserDto.password, 10);
            delete updateData.password;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as User;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    async getUsersByRole(role: string): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', role)
            .eq('status', 'ACTIVE');

        if (error) throw new Error(error.message);
        return data as User[];
    }
}
