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
    product_type: 'billboard' | 'megalight' | 'digital_screen' | 'bus_shelter' | 'bridge_banner' | 'raket' | 'giant_board' | 'BB' | 'LB' | 'MGL' | 'GB' | 'CLP' | 'MB' | 'KB' | 'other';
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
    created_at: Date;
    updated_at: Date;
}

export interface CreateCustomerRequestDto {
    client_id: string;
    product_type: 'billboard' | 'megalight' | 'digital_screen' | 'bus_shelter' | 'bridge_banner' | 'raket' | 'giant_board' | 'BB' | 'LB' | 'MGL' | 'GB' | 'CLP' | 'MB' | 'KB' | 'other';
    product_details?: string;
    quantity?: number;
    preferred_districts?: string[];
    start_date: string;
    end_date: string;
    budget_min?: number;
    budget_max?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    assigned_to?: string;
    request_number?: string;
}

export interface UpdateCustomerRequestDto {
    client_id?: string;
    product_type?: 'billboard' | 'megalight' | 'digital_screen' | 'bus_shelter' | 'bridge_banner' | 'BB' | 'LB' | 'MGL' | 'GB' | 'CLP' | 'MB' | 'KB' | 'other';
    product_details?: string;
    quantity?: number;
    preferred_districts?: string[];
    start_date?: string;
    end_date?: string;
    budget_min?: number;
    budget_max?: number;
    status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    assigned_to?: string;
}
