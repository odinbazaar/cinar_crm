import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../config/supabase.config';
import { CreateCustomerRequestDto, UpdateCustomerRequestDto, CustomerRequest } from './customer-requests.dto';

@Injectable()
export class CustomerRequestsService {
    private generateRequestNumber(): string {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `TLP-${year}${month}${day}-${random}`;
    }

    async findAll(): Promise<CustomerRequest[]> {
        const { data, error } = await supabase
            .from('customer_requests')
            .select(`
                *,
                client:clients (
                    id,
                    company_name,
                    contact_person,
                    phone,
                    email,
                    city
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customer requests:', error);
            throw new Error(error.message);
        }

        return data || [];
    }

    async findOne(id: string): Promise<CustomerRequest> {
        const { data, error } = await supabase
            .from('customer_requests')
            .select(`
                *,
                client:clients (
                    id,
                    company_name,
                    contact_person,
                    phone,
                    email,
                    city
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            throw new NotFoundException(`Customer request with ID ${id} not found`);
        }

        return data;
    }

    async findByClient(clientId: string): Promise<CustomerRequest[]> {
        const { data, error } = await supabase
            .from('customer_requests')
            .select(`
                *,
                client:clients (
                    id,
                    company_name,
                    contact_person,
                    phone,
                    email,
                    city
                )
            `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customer requests by client:', error);
            throw new Error(error.message);
        }

        return data || [];
    }

    async findByStatus(status: string): Promise<CustomerRequest[]> {
        const { data, error } = await supabase
            .from('customer_requests')
            .select(`
                *,
                client:clients (
                    id,
                    company_name,
                    contact_person,
                    phone,
                    email,
                    city
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customer requests by status:', error);
            throw new Error(error.message);
        }

        return data || [];
    }

    async create(createDto: CreateCustomerRequestDto): Promise<CustomerRequest> {
        const requestData = {
            ...createDto,
            client_id: createDto.client_id === '' ? null : createDto.client_id,
            request_number: createDto.request_number || this.generateRequestNumber(),
            status: 'pending',
            quantity: createDto.quantity || 1,
            priority: createDto.priority || 'medium',
        };

        const { data, error } = await supabase
            .from('customer_requests')
            .insert([requestData])
            .select(`
                *,
                client:clients (
                    id,
                    company_name,
                    contact_person,
                    phone,
                    email,
                    city
                )
            `)
            .single();

        if (error) {
            console.error('Error creating customer request:', error);
            throw new Error(error.message);
        }

        return data;
    }

    async update(id: string, updateDto: UpdateCustomerRequestDto): Promise<CustomerRequest> {
        const { data, error } = await supabase
            .from('customer_requests')
            .update(updateDto)
            .eq('id', id)
            .select(`
                *,
                client:clients (
                    id,
                    company_name,
                    contact_person,
                    phone,
                    email,
                    city
                )
            `)
            .single();

        if (error) {
            throw new NotFoundException(`Customer request with ID ${id} not found`);
        }

        return data;
    }

    async remove(id: string): Promise<void> {
        const { error } = await supabase
            .from('customer_requests')
            .delete()
            .eq('id', id);

        if (error) {
            throw new NotFoundException(`Customer request with ID ${id} not found`);
        }
    }
}
