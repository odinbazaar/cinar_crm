import { Injectable, UnauthorizedException } from '@nestjs/common';
import supabase from '../config/supabase.config';
import * as bcrypt from 'bcrypt';
import { LogsService } from '../logs/logs.service';


@Injectable()
export class AuthService {
    constructor(private readonly logsService: LogsService) { }

    async login(email: string, password: string) {
        console.log('🔐 Login attempt:', { email });

        // Giriş kodu e-posta değilse dummy domain ekliyoruz (Supabase Auth kısıtı için)
        const loginEmail = email.includes('@') ? email : `${email}@cinarcrm.com`;

        // DB'den kullanıcıyı bul (İzinler ve detaylar için)
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            await this.logsService.createLog({
                level: 'WARN',
                module: 'AUTH',
                message: `Başarısız giriş denemesi: ${email}`,
                details: 'Kullanıcı bulunamadı'
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            await this.logsService.createLog({
                level: 'WARN',
                module: 'AUTH',
                message: `Hatalı şifre denemesi: ${email}`,
                user_id: user.id,
                user_name: `${user.first_name} ${user.last_name}`
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // Return user without password
        const { password_hash, ...userWithoutPassword } = user;

        await this.logsService.createLog({
            level: 'INFO',
            module: 'AUTH',
            message: `Kullanıcı giriş yaptı: ${email}`,
            user_id: user.id,
            user_name: `${user.first_name} ${user.last_name}`
        });

        return {
            user: userWithoutPassword,
            message: 'Login successful',
        };
    }

    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
    }) {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                email: data.email,
                password_hash: hashedPassword,
                first_name: data.firstName,
                last_name: data.lastName,
                role: data.role,
                status: 'ACTIVE',
            })
            .select()
            .single();

        if (error) {
            await this.logsService.createLog({
                level: 'ERROR',
                module: 'USERS',
                message: `Kullanıcı oluşturma hatası: ${data.email}`,
                details: error.message
            });
            throw new Error(`Failed to create user: ${error.message}`);
        }

        await this.logsService.createLog({
            level: 'INFO',
            module: 'USERS',
            message: `Yeni kullanıcı oluşturuldu: ${data.email}`,
            details: `Rol: ${data.role}`
        });

        // Return user without password
        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            message: 'User created successfully',
        };
    }

    async getProfile(userId: string) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, role, status, avatar, phone, hourly_rate, created_at, updated_at')
            .eq('id', userId)
            .single();

        if (error || !user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
