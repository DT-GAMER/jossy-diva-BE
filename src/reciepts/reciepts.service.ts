// src/receipts/receipts.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateReceiptPDF } from './templates/reciept.template';
import { DateUtil } from '../common/utils/date.util';

const LOGO_URL =
  'https://res.cloudinary.com/dofiyn7bw/image/upload/v1770621010/Gemini_Generated_Image_sebyzqsebyzqseby-removebg-preview_viygn2.png';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate receipt by order number (website flow)
   */
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

  /**
   * Generate receipt by sale ID (walk-in & website)
   */
  async generateReceipt(
    saleId: string,
  ): Promise<Buffer> {
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

    // 1️⃣ Fetch logo from Cloudinary → Buffer
    const response = await fetch(LOGO_URL);
    const logoBuffer = Buffer.from(
      await response.arrayBuffer(),
    );

    // 2️⃣ Map items
    const items = sale.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.sellingPrice,
      total: item.sellingPrice * item.quantity,
    }));

    // 3️⃣ Generate PDF
    const doc = generateReceiptPDF(
      {
        receiptNumber: sale.receiptNumber,
        date: sale.createdAt.toLocaleString(),
        paymentMethod: sale.paymentMethod,
        items,
        totalAmount: sale.totalAmount,
      },
      logoBuffer,
    );

    // 4️⃣ Convert stream → Buffer
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () =>
        resolve(Buffer.concat(chunks)),
      );
      doc.on('error', reject);
    });
  }
}
