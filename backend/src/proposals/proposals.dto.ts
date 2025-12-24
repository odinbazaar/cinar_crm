export interface Proposal {
    id: string;
    proposal_number: string;
    title: string;
    client_id: string;
    project_id?: string;
    created_by_id: string;
    status: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    description?: string;
    terms?: string;
    valid_until?: Date;
    sent_at?: Date;
    viewed_at?: Date;
    accepted_at?: Date;
    pdf_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface ProposalItem {
    id: string;
    proposal_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    estimated_hours?: number;
    hourly_rate?: number;
    order: number;
}

export interface CreateProposalDto {
    title: string;
    client_id: string;
    project_id?: string;
    created_by_id: string;
    description?: string;
    terms?: string;
    valid_until?: Date;
    items: CreateProposalItemDto[];
}

export interface CreateProposalItemDto {
    description: string;
    quantity: number;
    unit_price: number;
    estimated_hours?: number;
    hourly_rate?: number;
}

export interface UpdateProposalDto {
    title?: string;
    status?: string;
    description?: string;
    terms?: string;
    valid_until?: Date;
}
