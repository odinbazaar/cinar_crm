import { Injectable, UnauthorizedException } from '@nestjs/common';
import supabase from '../config/supabase.config';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
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

        console.log('👤 User lookup result:', { user, error });

        if (error || !user) {
            console.log('❌ User not found');
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log('🔑 Password comparison:', {
            providedPassword: password,
            storedHash: user.password_hash,
            hashLength: user.password_hash?.length
        });

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        console.log('✅ Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ Password mismatch');
            throw new UnauthorizedException('Invalid credentials');
        }

        // Return user without password
        const { password_hash, ...userWithoutPassword } = user;

        console.log('✅ Login successful for:', email);

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
            throw new Error(`Failed to create user: ${error.message}`);
        }

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
