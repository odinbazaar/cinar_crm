import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    async findAll() {
        return this.inventoryService.findAll();
    }

    @Get('district/:district')
    async getByDistrict(@Param('district') district: string) {
        return this.inventoryService.getByDistrict(district);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.inventoryService.findOne(id);
    }

    @Post()
    async create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
        return this.inventoryService.create(createInventoryItemDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
        return this.inventoryService.update(id, updateInventoryItemDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.inventoryService.delete(id);
    }
}
