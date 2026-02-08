// src/jobs/jobs.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderCleanupJob } from './order-cleanup.jobs';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    InventoryModule,
  ],
  providers: [OrderCleanupJob],
})
export class JobsModule {}
