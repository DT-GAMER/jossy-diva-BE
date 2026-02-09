// src/receipts/receipts.module.ts

import { Module } from '@nestjs/common';
import { ReceiptsService } from './reciepts.service';
import { ReceiptsController } from './reciepts.controller';

@Module({
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
