import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { ProposalsModule } from './proposals/proposals.module';
import { InventoryModule } from './inventory/inventory.module';
import { BookingsModule } from './bookings/bookings.module';
import { TasksModule } from './tasks/tasks.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { CustomerRequestsModule } from './customer-requests/customer-requests.module';
import { FinanceModule } from './finance/finance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ProjectsModule,
    ProposalsModule,
    InventoryModule,
    BookingsModule,
    TasksModule,
    TimeEntriesModule,
    CustomerRequestsModule,
    FinanceModule,
    NotificationsModule,
    MailModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

