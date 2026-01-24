import apiClient from './api';
import type { User } from './authService';

// Types
export interface CreateUserDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    hourly_rate?: number;
    permissions?: string[];
}

export interface UpdateUserDto {
    first_name?: string;
    last_name?: string;
    phone?: string;
    hourly_rate?: number;
    avatar?: string;
    status?: string;
    permissions?: string[];
    email?: string;
    password?: string;
}

// Users Service
export const usersService = {
    async getAll(): Promise<User[]> {
        return apiClient.get<User[]>('/users');
    },

    async getOne(id: string): Promise<User> {
        return apiClient.get<User>(`/users/${id}`);
    },

    async getByRole(role: string): Promise<User[]> {
        return apiClient.get<User[]>(`/users/role/${role}`);
    },

    async create(data: CreateUserDto): Promise<User> {
        return apiClient.post<User>('/users', data);
    },

    async update(id: string, data: UpdateUserDto): Promise<User> {
        return apiClient.put<User>(`/users/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/users/${id}`);
    },
};

export default usersService;
