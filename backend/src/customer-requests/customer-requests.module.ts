import { Module } from '@nestjs/common';
import { CustomerRequestsController } from './customer-requests.controller';
import { CustomerRequestsService } from './customer-requests.service';

@Module({
    controllers: [CustomerRequestsController],
    providers: [CustomerRequestsService],
    exports: [CustomerRequestsService],
})
export class CustomerRequestsModule { }
