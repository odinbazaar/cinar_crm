import apiClient from './api';

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    avatar?: string;
    phone?: string;
    hourly_rate?: number;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    user: User;
    message: string;
}

// Authentication Service
export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/login', credentials);
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/register', data);
    },

    async getProfile(userId: string): Promise<User> {
        return apiClient.get<User>(`/auth/profile/${userId}`);
    },
};

export default authService;
