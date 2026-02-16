import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { LogsService, SystemLog } from './logs.service';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Get()
    findAll() {
        return this.logsService.findAll();
    }

    @Post()
    create(@Body() log: Omit<SystemLog, 'id' | 'created_at'>) {
        return this.logsService.createLog(log);
    }

    @Delete('clear')
    clear() {
        return this.logsService.clearLogs();
    }
}
