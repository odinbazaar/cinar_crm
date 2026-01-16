// Bookings DTOs
export interface Booking {
    id: string;
    inventory_item_id: string;
    project_id?: string;
    client_id?: string;
    brand_name?: string;
    network?: string;
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
}

export interface CreateBookingDto {
    inventory_item_id: string;
    project_id?: string;
    client_id?: string;
    brand_name?: string;
    network?: string;
    brand_option_1?: string;
    brand_option_2?: string;
    brand_option_3?: string;
    brand_option_4?: string;
    start_date: string;
    end_date: string;
    status?: string;
    notes?: string;
}

export interface UpdateBookingDto {
    status?: string;
    brand_option_1?: string;
    brand_option_2?: string;
    brand_option_3?: string;
    brand_option_4?: string;
    notes?: string;
}

