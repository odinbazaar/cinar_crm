import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import supabase from '../config/supabase.config';
import { Booking, CreateBookingDto, UpdateBookingDto } from './bookings.dto';

@Injectable()
export class BookingsService {
    async findAll(): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) {
            console.error('BookingsService.findAll Error:', error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return (data || []) as Booking[];
    }

    async findOne(id: string): Promise<Booking | null> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Booking;
    }

    async create(createBookingDto: CreateBookingDto): Promise<Booking> {
        console.log('📝 Creating Booking Payload:', JSON.stringify(createBookingDto, null, 2));

        const { data, error } = await supabase
            .from('bookings')
            .insert([{ ...createBookingDto, status: createBookingDto.status || 'OPTION' }])
            .select()
            .single();

        if (error) {
            console.error('❌ Create Booking Failed:', error);
            throw new Error(`Booking Creation Failed: ${error.message}`);
        }

        console.log('✅ Booking Created Successfully:', data?.id);
        return data as Booking;
    }

    async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
        const { data, error } = await supabase
            .from('bookings')
            .update(updateBookingDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Booking;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }

    async getByInventoryItem(inventoryItemId: string): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('inventory_item_id', inventoryItemId)
            .order('start_date');

        if (error) throw new Error(error.message);
        return data as Booking[];
    }

    async getByProject(projectId: string): Promise<Booking[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('project_id', projectId);

        if (error) throw new Error(error.message);
        return data as Booking[];
    }
}
