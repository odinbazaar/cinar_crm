import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './notifications.dto';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Query('userId') userId?: string) {
        return this.notificationsService.findAll(userId);
    }

    @Get('unread-count')
    async getUnreadCount(@Query('userId') userId?: string) {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    @Post()
    async create(@Body() dto: CreateNotificationDto) {
        return this.notificationsService.create(dto);
    }

    @Put(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Put('read-all')
    async markAllAsRead(@Query('userId') userId?: string) {
        await this.notificationsService.markAllAsRead(userId);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.notificationsService.delete(id);
        return { success: true };
    }
}
