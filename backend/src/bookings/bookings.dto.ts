// Bookings DTOs
export interface Booking {
    id: string;
    inventory_item_id: string;
    project_id?: string;
    client_id?: string;
    start_date: Date;
    end_date: Date;
    status: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateBookingDto {
    inventory_item_id: string;
    project_id?: string;
    client_id?: string;
    start_date: Date;
    end_date: Date;
    status?: string;
    notes?: string;
}

export interface UpdateBookingDto {
    start_date?: Date;
    end_date?: Date;
    status?: string;
    notes?: string;
}
