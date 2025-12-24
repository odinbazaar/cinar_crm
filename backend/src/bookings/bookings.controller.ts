import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './bookings.dto';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Get()
    async findAll() {
        return this.bookingsService.findAll();
    }

    @Get('inventory/:inventoryItemId')
    async getByInventoryItem(@Param('inventoryItemId') inventoryItemId: string) {
        return this.bookingsService.getByInventoryItem(inventoryItemId);
    }

    @Get('project/:projectId')
    async getByProject(@Param('projectId') projectId: string) {
        return this.bookingsService.getByProject(projectId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @Post()
    async create(@Body() createBookingDto: CreateBookingDto) {
        return this.bookingsService.create(createBookingDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        return this.bookingsService.update(id, updateBookingDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.bookingsService.delete(id);
    }
}
