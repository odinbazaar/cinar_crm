// Inventory DTOs
export interface InventoryItem {
    id: string;
    code: string;
    type: string;
    district: string;
    neighborhood?: string;
    address: string;
    coordinates?: string;
    network?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateInventoryItemDto {
    code: string;
    type: string;
    district: string;
    neighborhood?: string;
    address: string;
    coordinates?: string;
    network?: string;
}

export interface UpdateInventoryItemDto {
    code?: string;
    type?: string;
    district?: string;
    neighborhood?: string;
    address?: string;
    coordinates?: string;
    network?: string;
    is_active?: boolean;
}
