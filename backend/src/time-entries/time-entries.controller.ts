import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from './time-entries.dto';

@Controller('time-entries')
export class TimeEntriesController {
    constructor(private readonly timeEntriesService: TimeEntriesService) { }

    @Get()
    async findAll() {
        return this.timeEntriesService.findAll();
    }

    @Get('user/:userId')
    async getByUser(@Param('userId') userId: string) {
        return this.timeEntriesService.getByUser(userId);
    }

    @Get('project/:projectId')
    async getByProject(@Param('projectId') projectId: string) {
        return this.timeEntriesService.getByProject(projectId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.timeEntriesService.findOne(id);
    }

    @Post()
    async create(@Body() createTimeEntryDto: CreateTimeEntryDto) {
        return this.timeEntriesService.create(createTimeEntryDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTimeEntryDto: UpdateTimeEntryDto) {
        return this.timeEntriesService.update(id, updateTimeEntryDto);
    }

    @Put(':id/stop')
    async stopTimer(@Param('id') id: string) {
        return this.timeEntriesService.stopTimer(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.timeEntriesService.delete(id);
    }
}
