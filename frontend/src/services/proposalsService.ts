import apiClient from './api';

// Types
export interface ProposalItem {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total?: number;
    estimated_hours?: number;
    hourly_rate?: number;
    order?: number;
}

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
    valid_until?: string;
    sent_at?: string;
    viewed_at?: string;
    accepted_at?: string;
    pdf_url?: string;
    created_at: string;
    updated_at: string;
    client?: any;
    created_by?: any;
    items?: ProposalItem[];
}

export interface CreateProposalDto {
    title: string;
    client_id: string;
    project_id?: string;
    created_by_id: string;
    description?: string;
    terms?: string;
    valid_until?: string;
    items: ProposalItem[];
}

export interface UpdateProposalDto {
    title?: string;
    status?: string;
    description?: string;
    terms?: string;
    valid_until?: string;
}

// Proposals Service
export const proposalsService = {
    async getAll(): Promise<Proposal[]> {
        return apiClient.get<Proposal[]>('/proposals');
    },

    async getOne(id: string): Promise<Proposal> {
        return apiClient.get<Proposal>(`/proposals/${id}`);
    },

    async create(data: CreateProposalDto): Promise<Proposal> {
        return apiClient.post<Proposal>('/proposals', data);
    },

    async update(id: string, data: UpdateProposalDto): Promise<Proposal> {
        return apiClient.put<Proposal>(`/proposals/${id}`, data);
    },

    async updateStatus(id: string, status: string): Promise<Proposal> {
        return apiClient.put<Proposal>(`/proposals/${id}/status/${status}`, {});
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/proposals/${id}`);
    },
};

export default proposalsService;
