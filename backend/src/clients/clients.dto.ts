export interface Client {
    id: string;
    name: string;
    company_name: string;
    trade_name?: string;
    type: string;
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
    lead_stage: string;
    brand_mission?: string;
    brand_tone?: string;
    brand_values?: string;
    target_audience?: string;
    account_manager_id?: string;
    notes?: string;
    // Status
    status: 'active' | 'inactive' | 'potential';
    is_active: boolean;
    lost_reason?: string;
    lost_date?: Date;
    // Stats
    total_projects?: number;
    total_revenue?: number;
    // Timestamps
    created_at: Date;
    updated_at: Date;
}

export interface CreateClientDto {
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
    status?: 'active' | 'inactive' | 'potential';
}

export interface UpdateClientDto {
    name?: string;
    company_name?: string;
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
    status?: 'active' | 'inactive' | 'potential';
    is_active?: boolean;
    lost_reason?: string;
}
