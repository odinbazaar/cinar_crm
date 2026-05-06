import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';

@Injectable()
export class InventoryService {
    async findAll(): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .order('code');

        if (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return (data || []) as InventoryItem[];
    }

    async findOne(id: string): Promise<InventoryItem | null> {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as InventoryItem;
    }

    async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
        // Convert camelCase routeNo to snake_case route_no for database
        const dbData: any = { ...createInventoryItemDto, is_active: true };
        if ('routeNo' in dbData) {
            dbData.route_no = dbData.routeNo;
            delete dbData.routeNo;
        }
        const beMap: Record<string, string> = {
            bePeriod: 'be_period',
            beUnitPrice: 'be_unit_price',
            beDiscountedPrice: 'be_discounted_price',
            bePrintingCost: 'be_printing_cost',
            beOperationCost: 'be_operation_cost',
        };
        for (const k of Object.keys(beMap)) {
            if (k in dbData) {
                dbData[beMap[k]] = dbData[k];
                delete dbData[k];
            }
        }

        const { data, error } = await supabase
            .from('inventory_items')
            .insert([dbData])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as InventoryItem;
    }

    async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
        const incoming: any = { ...updateInventoryItemDto };
        if ('routeNo' in incoming) {
            incoming.route_no = incoming.routeNo;
            delete incoming.routeNo;
        }
        const beMap: Record<string, string> = {
            bePeriod: 'be_period',
            beUnitPrice: 'be_unit_price',
            beDiscountedPrice: 'be_discounted_price',
            bePrintingCost: 'be_printing_cost',
            beOperationCost: 'be_operation_cost',
        };
        for (const k of Object.keys(beMap)) {
            if (k in incoming) {
                incoming[beMap[k]] = incoming[k];
                delete incoming[k];
            }
        }

        const allowed = [
            'code', 'type', 'district', 'neighborhood', 'address',
            'coordinates', 'network', 'route_no', 'is_active',
            'be_period', 'be_unit_price', 'be_discounted_price',
            'be_printing_cost', 'be_operation_cost',
        ];
        const dbData: any = {};
        for (const k of allowed) {
            if (k in incoming && incoming[k] !== undefined) {
                const v = incoming[k];
                dbData[k] = typeof v === 'string' ? v.normalize('NFC').trim() : v;
            }
        }

        const { data, error } = await supabase
            .from('inventory_items')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[inventory.update] Supabase error:', { id, dbData, error });
            throw new HttpException(
                `Inventory update failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        return data as InventoryItem;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('inventory_items').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    async getByDistrict(district: string): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('district', district)
            .eq('is_active', true);

        if (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return (data || []) as InventoryItem[];
    }
}
