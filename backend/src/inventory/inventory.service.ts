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
        const { data, error } = await supabase
            .from('inventory_items')
            .insert([{ ...createInventoryItemDto, is_active: true }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as InventoryItem;
    }

    async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('inventory_items')
            .update(updateInventoryItemDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
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
