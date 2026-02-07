import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { MediaModule } from './media/media.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { SalesModule } from './sales/sales.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { PublicModule } from './public/public.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule, MediaModule, InventoryModule, OrdersModule, SalesModule, DashboardModule, ReportsModule, PublicModule, JobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
