import apiClient from './api';

// Types
export interface CustomerRequest {
    id: string;
    request_number: string;
    client_id: string;
    client?: {
        id: string;
        company_name: string;
        contact_person?: string;
        phone?: string;
        email?: string;
        city?: string;
    };
    product_type: 'billboard' | 'megalight' | 'digital_screen' | 'bus_shelter' | 'bridge_banner' | 'raket' | 'giant_board' | 'other';
    product_details?: string;
    quantity: number;
    preferred_districts?: string[];
    start_date: string;
    end_date: string;
    budget_min?: number;
    budget_max?: number;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    assigned_to?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCustomerRequestDto {
    client_id: string;
    product_type: 'billboard' | 'megalight' | 'digital_screen' | 'bus_shelter' | 'bridge_banner' | 'raket' | 'giant_board' | 'other';
    product_details?: string;
    quantity?: number;
    preferred_districts?: string[];
    start_date: string;
    end_date: string;
    budget_min?: number;
    budget_max?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
}

export interface UpdateCustomerRequestDto extends Partial<CreateCustomerRequestDto> {
    status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
}

// Customer Requests Service
export const customerRequestsService = {
    async getAll(): Promise<CustomerRequest[]> {
        return apiClient.get<CustomerRequest[]>('/customer-requests');
    },

    async getOne(id: string): Promise<CustomerRequest> {
        return apiClient.get<CustomerRequest>(`/customer-requests/${id}`);
    },

    async getByClient(clientId: string): Promise<CustomerRequest[]> {
        return apiClient.get<CustomerRequest[]>(`/customer-requests/client/${clientId}`);
    },

    async getByStatus(status: string): Promise<CustomerRequest[]> {
        return apiClient.get<CustomerRequest[]>(`/customer-requests/status/${status}`);
    },

    async create(data: CreateCustomerRequestDto): Promise<CustomerRequest> {
        return apiClient.post<CustomerRequest>('/customer-requests', data);
    },

    async update(id: string, data: UpdateCustomerRequestDto): Promise<CustomerRequest> {
        return apiClient.put<CustomerRequest>(`/customer-requests/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/customer-requests/${id}`);
    },
};

export default customerRequestsService;
