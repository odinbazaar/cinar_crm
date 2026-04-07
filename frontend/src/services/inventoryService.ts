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
    bePeriod?: string;
    beUnitPrice?: number;
    beDiscountedPrice?: number;
    bePrintingCost?: number;
    beOperationCost?: number;
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
    bePeriod?: string;
    beUnitPrice?: number;
    beDiscountedPrice?: number;
    bePrintingCost?: number;
    beOperationCost?: number;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {
    is_active?: boolean;
}

function mapInventoryItem(item: any): InventoryItem {
    return {
        ...item,
        routeNo: item.route_no ?? item.routeNo,
        bePeriod: item.be_period ?? item.bePeriod,
        beUnitPrice: item.be_unit_price ?? item.beUnitPrice,
        beDiscountedPrice: item.be_discounted_price ?? item.beDiscountedPrice,
        bePrintingCost: item.be_printing_cost ?? item.bePrintingCost,
        beOperationCost: item.be_operation_cost ?? item.beOperationCost,
    };
}

// Inventory Service
export const inventoryService = {
    async getAll(): Promise<InventoryItem[]> {
        const data = await apiClient.get<any[]>('/inventory');
        // Map snake_case route_no to camelCase routeNo
        return data.map(mapInventoryItem);
    },

    async getOne(id: string): Promise<InventoryItem> {
        const data = await apiClient.get<any>(`/inventory/${id}`);
        return mapInventoryItem(data);
    },

    async getByDistrict(district: string): Promise<InventoryItem[]> {
        const data = await apiClient.get<any[]>(`/inventory/district/${district}`);
        return data.map(mapInventoryItem);
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
