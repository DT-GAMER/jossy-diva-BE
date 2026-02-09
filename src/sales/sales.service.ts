// src/sales/sales.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PriceUtil } from '../common/utils/price.util';
import { SaleSource } from '../common/constants/sale-source.constant';
import { ReceiptsService } from '../reciepts/reciepts.service';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  /**
   * Create WALK-IN sale only
   * (Website sales are auto-created by OrdersService)
   */
  async createSale(dto: CreateSaleDto) {
    if (!dto.items.length) {
      throw new BadRequestException('Sale must have at least one item');
    }

    let totalAmount = 0;
    let totalProfit = 0;

    const saleItemsData: Prisma.SaleItemUncheckedCreateWithoutSaleInput[] =
      [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // WALK-IN → deduct stock immediately
      await this.inventoryService.deductStock(
        product.id,
        item.quantity,
      );

      const profit = PriceUtil.calculateProfit(
        product.costPrice,
        item.sellingPrice,
        item.quantity,
      );

      totalAmount += item.sellingPrice * item.quantity;
      totalProfit += profit;

      saleItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        costPrice: product.costPrice,
      });
    }

    // 1️⃣ Create sale record
    const sale = await this.prisma.sale.create({
      data: {
        source: SaleSource.WALK_IN,
        totalAmount,
        profit: totalProfit,
        paymentMethod: dto.paymentMethod,
        items: {
          create: saleItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 2️⃣ Generate receipt (NON-BLOCKING)
    this.receiptsService
      .generateReceipt(sale.id)
      .catch((error) => {
        this.logger.error(
          `Failed to generate receipt for sale ${sale.id}`,
          error,
        );
      });

    return sale;
  }

  /**
   * Get all sales (admin)
   */
  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
