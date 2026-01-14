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

        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    email: createUserDto.email,
                    password_hash: hashedPassword,
                    first_name: createUserDto.first_name,
                    last_name: createUserDto.last_name,
                    role: createUserDto.role,
                    phone: createUserDto.phone,
                    hourly_rate: createUserDto.hourly_rate,
                    status: 'ACTIVE',
                },
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as User;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .update(updateUserDto)
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
