import apiClient from './api';

// Types
export interface Client {
    id: string;
    name?: string;
    company_name: string;
    trade_name?: string;
    type?: string;
    sector?: string;
    tax_office?: string;
    tax_number?: string;
    // Address fields
    address?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    country?: string;
    // Contact fields
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    // Contact person fields
    contact_person?: string;
    contact_title?: string;
    contact_phone?: string;
    contact_email?: string;
    // CRM fields
    lead_source?: string;
    lead_stage?: string;
    brand_mission?: string;
    brand_tone?: string;
    brand_values?: string;
    target_audience?: string;
    account_manager_id?: string;
    notes?: string;
    // Status
    status: 'active' | 'inactive' | 'potential';
    is_active: boolean;
    // Stats
    total_projects?: number;
    total_revenue?: number;
    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface CreateClientDto {
    name?: string;
    company_name: string;
    trade_name?: string;
    type?: string;
    sector?: string;
    tax_office?: string;
    tax_number?: string;
    address?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    contact_person?: string;
    contact_title?: string;
    contact_phone?: string;
    contact_email?: string;
    lead_source?: string;
    lead_stage?: string;
    notes?: string;
    status?: 'active' | 'inactive' | 'potential';
    account_manager_id?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
    is_active?: boolean;
    lost_reason?: string;
}

// Clients Service
export const clientsService = {
    async getAll(): Promise<Client[]> {
        return apiClient.get<Client[]>('/clients');
    },

    async getOne(id: string): Promise<Client> {
        return apiClient.get<Client>(`/clients/${id}`);
    },

    async getActive(): Promise<Client[]> {
        return apiClient.get<Client[]>('/clients/active');
    },

    async getByStage(stage: string): Promise<Client[]> {
        return apiClient.get<Client[]>(`/clients/stage/${stage}`);
    },

    async create(data: CreateClientDto): Promise<Client> {
        return apiClient.post<Client>('/clients', data);
    },

    async update(id: string, data: UpdateClientDto): Promise<Client> {
        return apiClient.put<Client>(`/clients/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/clients/${id}`);
    },
};

export default clientsService;
