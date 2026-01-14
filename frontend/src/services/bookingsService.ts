import apiClient from './api';

// Types
export interface Booking {
    id: string;
    inventory_item_id: string;
    project_id?: string;
    client_id?: string;
    brand_name?: string;
    network?: string;
    face_number?: number;
    brand_option_1?: string;
    brand_option_2?: string;
    brand_option_3?: string;
    brand_option_4?: string;
    start_date: string;
    end_date: string;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    inventory_item?: any;
    project?: any;
    client?: any;
}

export interface CreateBookingDto {
    inventory_item_id: string;
    project_id?: string;
    client_id?: string;
    brand_name?: string;
    network?: string;
    face_number?: number;
    brand_option_1?: string;
    brand_option_2?: string;
    brand_option_3?: string;
    brand_option_4?: string;
    start_date: string;
    end_date: string;
    status?: string;
    notes?: string;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> { }

// Bookings Service
export const bookingsService = {
    async getAll(): Promise<Booking[]> {
        return apiClient.get<Booking[]>('/bookings');
    },

    async getOne(id: string): Promise<Booking> {
        return apiClient.get<Booking>(`/bookings/${id}`);
    },

    async getByInventoryItem(inventoryItemId: string): Promise<Booking[]> {
        return apiClient.get<Booking[]>(`/bookings/inventory/${inventoryItemId}`);
    },

    async getByProject(projectId: string): Promise<Booking[]> {
        return apiClient.get<Booking[]>(`/bookings/project/${projectId}`);
    },

    async create(data: CreateBookingDto): Promise<Booking> {
        return apiClient.post<Booking>('/bookings', data);
    },

    async update(id: string, data: UpdateBookingDto): Promise<Booking> {
        return apiClient.put<Booking>(`/bookings/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/bookings/${id}`);
    },
};

export default bookingsService;
