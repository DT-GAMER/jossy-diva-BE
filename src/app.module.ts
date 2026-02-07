import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import configs from './config';
import { environmentValidationSchema } from './config/environment.config';

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
import { PrismaModule } from '../prisma/prisma.module';

import { AdminGuard } from './common/guards/admin.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      validationSchema: environmentValidationSchema,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    MediaModule,
    InventoryModule,
    OrdersModule,
    SalesModule,
    DashboardModule,
    ReportsModule,
    PublicModule,
    JobsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
})
export class AppModule {}
