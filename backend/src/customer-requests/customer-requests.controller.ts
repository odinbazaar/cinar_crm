import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CustomerRequestsService } from './customer-requests.service';
import { CreateCustomerRequestDto, UpdateCustomerRequestDto } from './customer-requests.dto';

@Controller('customer-requests')
export class CustomerRequestsController {
    constructor(private readonly customerRequestsService: CustomerRequestsService) { }

    @Get()
    async findAll() {
        return this.customerRequestsService.findAll();
    }

    @Get('status/:status')
    async findByStatus(@Param('status') status: string) {
        return this.customerRequestsService.findByStatus(status);
    }

    @Get('client/:clientId')
    async findByClient(@Param('clientId') clientId: string) {
        return this.customerRequestsService.findByClient(clientId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.customerRequestsService.findOne(id);
    }

    @Post()
    async create(@Body() createDto: CreateCustomerRequestDto) {
        return this.customerRequestsService.create(createDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateCustomerRequestDto) {
        return this.customerRequestsService.update(id, updateDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.customerRequestsService.remove(id);
    }
}
