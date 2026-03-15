import { Controller, Post } from '@nestjs/common';
import { BookingRemindersService } from './booking-reminders.service';

@Controller('booking-reminders')
export class BookingRemindersController {
    constructor(private readonly service: BookingRemindersService) { }

    // Manuel tetikleme: POST /booking-reminders/check
    @Post('check')
    async manualCheck() {
        return this.service.triggerManualCheck();
    }
}
