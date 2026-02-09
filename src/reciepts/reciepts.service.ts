// src/receipts/receipts.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateReceiptPDF } from './templates/reciept.template';

const LOGO_URL =
  'https://res.cloudinary.com/dofiyn7bw/image/upload/v1770621010/Gemini_Generated_Image_sebyzqsebyzqseby-removebg-preview_viygn2.png';
const PHONE_ICON_URL =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/260e.png';
const INSTAGRAM_ICON_URL =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4f7.png';

const TRANSPARENT_PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlT0W4AAAAASUVORK5CYII=',
  'base64',
);

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async fetchImageBuffer(
    url: string,
  ): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      return TRANSPARENT_PNG_1X1;
    }
    return Buffer.from(await response.arrayBuffer());
  }

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

    // 1️⃣ Fetch assets
    const [logoBuffer, phoneIcon, instagramIcon] =
      await Promise.all([
        this.fetchImageBuffer(LOGO_URL),
        this.fetchImageBuffer(PHONE_ICON_URL),
        this.fetchImageBuffer(INSTAGRAM_ICON_URL),
      ]);

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
      phoneIcon,
      instagramIcon,
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
