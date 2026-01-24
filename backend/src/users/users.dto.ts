export interface User {
    id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    avatar?: string;
    phone?: string;
    hourly_rate?: number;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    hourly_rate?: number;
}

export interface UpdateUserDto {
    first_name?: string;
    last_name?: string;
    phone?: string;
    hourly_rate?: number;
    avatar?: string;
    status?: string;
    email?: string;
    password?: string;
    permissions?: string[];
}
