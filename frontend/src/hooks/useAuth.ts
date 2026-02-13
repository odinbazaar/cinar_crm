import { useState, useEffect } from 'react';

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
    permissions?: string[];
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    return {
        user,
        isAdmin,
        isManager,
        role: user?.role
    };
}
