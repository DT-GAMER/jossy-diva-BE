// src/receipts/receipts.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReceiptNumberUtil } from '../utils/reciept-number.util';
import { generateReceiptPDF } from './templates/reciept.template';
import { DateUtil } from '../common/utils/date.util';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReceiptByOrder(
  orderNumber: string,
): Promise<Buffer> {
  const sale = await this.prisma.sale.findFirst({
    where: { orderNumber },
  });

  if (!sale) {
    throw new NotFoundException(
      'Sale not found for this order',
    );
  }

  return this.generateReceipt(sale.id);
}


  async generateReceipt(saleId: string): Promise<Buffer> {
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
      throw new NotFoundException('Sale not found');
    }

    const countOnSaleDay = await this.prisma.sale.count({
      where: {
        createdAt: {
          gte: DateUtil.startOfDay(sale.createdAt),
          lte: sale.createdAt,
        },
      },
    });

    const receiptNumber = ReceiptNumberUtil.generate(
      sale.createdAt,
      Math.max(countOnSaleDay, 1),
    );

    const items = sale.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.sellingPrice,
      total: item.sellingPrice * item.quantity,
    }));

    const doc = generateReceiptPDF({
      receiptNumber,
      date: sale.createdAt.toLocaleString(),
      paymentMethod: sale.paymentMethod,
      items,
      totalAmount: sale.totalAmount,
    });

    const chunks: Buffer[] = [];

    return new Promise((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
