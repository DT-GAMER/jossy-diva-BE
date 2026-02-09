// src/receipts/receipts.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGenerator } from '../pdf/pdf';
import { generateReceiptHTML } from './templates/reciept-html';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate receipt by ORDER NUMBER (website)
   */
  async generateReceiptByOrder(
    orderNumber: string,
  ): Promise<Buffer> {
    this.logger.log(
      `Generating receipt for orderNumber=${orderNumber}`,
    );

    const sale = await this.prisma.sale.findFirst({
      where: { orderNumber },
    });

    if (!sale) {
      this.logger.warn(
        `No sale found for orderNumber=${orderNumber}`,
      );
      throw new NotFoundException(
        'Sale not found for this order',
      );
    }

    return this.generateReceipt(sale.id);
  }

  /**
   * Generate receipt by SALE ID (walk-in & website)
   */
  async generateReceipt(
    saleId: string,
  ): Promise<Buffer> {
    this.logger.log(
      `Generating receipt for saleId=${saleId}`,
    );

    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!sale) {
        this.logger.warn(
          `Sale not found for saleId=${saleId}`,
        );
        throw new NotFoundException('Sale not found');
      }

      if (!sale.items.length) {
        this.logger.warn(
          `Sale ${saleId} has no items`,
        );
        throw new NotFoundException(
          'No items found for this sale',
        );
      }

      // Map items
      const items = sale.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        total: item.sellingPrice * item.quantity,
      }));

      const date = sale.createdAt.toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const html = generateReceiptHTML({
        receiptNumber: sale.receiptNumber,
        date,
        paymentMethod: sale.paymentMethod,
        items,
        totalAmount: sale.totalAmount,
      });

      this.logger.debug(
        `HTML generated for saleId=${saleId} (length=${html.length})`,
      );

      // Generate PDF
      const pdf = await PdfGenerator.generatePdf({
        html,
      });

      this.logger.log(
        `PDF generated successfully for saleId=${saleId} (size=${pdf.length} bytes)`,
      );

      return pdf;
    } catch (error) {
      // 🔴 LOG FULL ERROR DETAILS
      this.logger.error(
        `Failed to generate receipt for saleId=${saleId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to generate receipt',
      );
    }
  }
}
