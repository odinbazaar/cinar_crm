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
    routeNo?: string;
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
    routeNo?: string;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {
    is_active?: boolean;
}

// Inventory Service
export const inventoryService = {
    async getAll(): Promise<InventoryItem[]> {
        const data = await apiClient.get<any[]>('/inventory');
        // Map snake_case route_no to camelCase routeNo
        return data.map(item => ({
            ...item,
            routeNo: item.route_no || item.routeNo
        }));
    },

    async getOne(id: string): Promise<InventoryItem> {
        const data = await apiClient.get<any>(`/inventory/${id}`);
        return { ...data, routeNo: data.route_no || data.routeNo };
    },

    async getByDistrict(district: string): Promise<InventoryItem[]> {
        const data = await apiClient.get<any[]>(`/inventory/district/${district}`);
        return data.map(item => ({
            ...item,
            routeNo: item.route_no || item.routeNo
        }));
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
