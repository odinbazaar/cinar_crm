import { Module } from '@nestjs/common';
import { BookingRemindersService } from './booking-reminders.service';
import { BookingRemindersController } from './booking-reminders.controller';

@Module({
    controllers: [BookingRemindersController],
    providers: [BookingRemindersService],
})
export class BookingRemindersModule { }
