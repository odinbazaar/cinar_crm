import { Controller, Get, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Get('dashboard')
    async getDashboardStats(@Query('period') period: string) {
        return this.financeService.getDashboardData(period);
    }
}
