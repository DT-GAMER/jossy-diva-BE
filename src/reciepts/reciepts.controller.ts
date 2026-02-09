// src/receipts/receipts.controller.ts

import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Version } from '@nestjs/common';

import { ReceiptsService } from './reciepts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Receipts')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'receipts', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

   /**
   * Download receipt by SALE ID
   * (walk-in & website sales)
   */
  @Get('sale/:saleId')
  async downloadBySale(
    @Param('saleId') saleId: string,
    @Res() res: Response,
  ) {
    const pdf =
      await this.receiptsService.generateReceipt(saleId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="receipt-${saleId}.pdf"`,
    );

    res.send(pdf);
  }

  /**
   * Download receipt by ORDER NUMBER
   * (website sales only)
   */
  @Get('order/:orderNumber')
  async downloadByOrder(
    @Param('orderNumber') orderNumber: string,
    @Res() res: Response,
  ) {
    const pdf =
      await this.receiptsService.generateReceiptByOrder(
        orderNumber,
      );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="receipt-${orderNumber}.pdf"`,
    );

    res.send(pdf);
  }
}
