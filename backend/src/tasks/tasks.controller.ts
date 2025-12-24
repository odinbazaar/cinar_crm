import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    async findAll() {
        return this.tasksService.findAll();
    }

    @Get('project/:projectId')
    async getByProject(@Param('projectId') projectId: string) {
        return this.tasksService.getByProject(projectId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Post()
    async create(@Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(createTaskDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Post(':id/assign/:userId')
    async assignUser(@Param('id') id: string, @Param('userId') userId: string) {
        return this.tasksService.assignUser(id, userId);
    }

    @Delete(':id/assign/:userId')
    async unassignUser(@Param('id') id: string, @Param('userId') userId: string) {
        return this.tasksService.unassignUser(id, userId);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.tasksService.delete(id);
    }
}
