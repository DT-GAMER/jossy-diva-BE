// src/sales/sales.module.ts

import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { ReceiptsModule } from '../reciepts/reciepts.module';

@Module({
  imports: [InventoryModule,  ReceiptsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
