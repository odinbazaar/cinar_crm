import apiClient from './api';

// Types
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
    created_at: string;
    updated_at: string;
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

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {
    is_active?: boolean;
}

// Inventory Service
export const inventoryService = {
    async getAll(): Promise<InventoryItem[]> {
        return apiClient.get<InventoryItem[]>('/inventory');
    },

    async getOne(id: string): Promise<InventoryItem> {
        return apiClient.get<InventoryItem>(`/inventory/${id}`);
    },

    async getByDistrict(district: string): Promise<InventoryItem[]> {
        return apiClient.get<InventoryItem[]>(`/inventory/district/${district}`);
    },

    async create(data: CreateInventoryItemDto): Promise<InventoryItem> {
        return apiClient.post<InventoryItem>('/inventory', data);
    },

    async update(id: string, data: UpdateInventoryItemDto): Promise<InventoryItem> {
        return apiClient.put<InventoryItem>(`/inventory/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/inventory/${id}`);
    },
};

export default inventoryService;
