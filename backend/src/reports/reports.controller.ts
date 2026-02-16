import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('weekly')
    async getWeeklyStats() {
        return this.reportsService.getWeeklyStats();
    }

    @Get('employee-reports')
    async getEmployeeReports(@Query('userId') userId?: string) {
        return this.reportsService.getEmployeeReports(userId);
    }

    @Post('employee-reports/submit')
    async submitReport(@Body() body: { userId: string; weekStarting: string; content: string }) {
        return this.reportsService.submitEmployeeReport(body.userId, body.weekStarting, body.content);
    }

    @Post('employee-reports/review')
    async reviewReport(@Body() body: { reportId: string; managerId: string; reviewNote: string }) {
        return this.reportsService.reviewEmployeeReport(body.reportId, body.managerId, body.reviewNote);
    }
}
