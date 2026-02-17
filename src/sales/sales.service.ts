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
import { ReceiptNumberUtil } from '../utils/reciept-number.util';
import { DateUtil } from '../common/utils/date.util';
import { FilterSalesDto } from './dto/filter-sales.dto';

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

    // ✅ Generate receipt number (standardized)
    const receiptDate = DateUtil.now();
    const saleCountToday = await this.prisma.sale.count({
      where: {
        createdAt: {
          gte: DateUtil.startOfDay(receiptDate),
          lte: DateUtil.endOfDay(receiptDate),
        },
      },
    });

    const receiptNumber = ReceiptNumberUtil.generate(
      receiptDate,
      saleCountToday + 1,
    );

    // 1️⃣ Create sale
    const sale = await this.prisma.sale.create({
      data: {
        receiptNumber,
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

    // 2️⃣ Generate receipt PDF (non-blocking)
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
  async findAll(filters: FilterSalesDto) {
    const where: Prisma.SaleWhereInput = {};

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.search) {
      where.OR = [
        {
          receiptNumber: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          orderNumber: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          customerPhone: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const hasStartEnd = !!(filters.startDate || filters.endDate);
    const hasDate = !!filters.date;
    const isToday = !!filters.today;

    if (isToday && (hasDate || hasStartEnd)) {
      throw new BadRequestException(
        'Use only one of today, date, or startDate/endDate',
      );
    }

    if (hasDate && hasStartEnd) {
      throw new BadRequestException(
        'Use either date or startDate/endDate, not both',
      );
    }

    if (isToday) {
      const today = DateUtil.now();
      where.createdAt = {
        gte: DateUtil.startOfDay(today),
        lte: DateUtil.endOfDay(today),
      };
    } else if (hasDate) {
      const date = new Date(filters.date as string);
      where.createdAt = {
        gte: DateUtil.startOfDay(date),
        lte: DateUtil.endOfDay(date),
      };
    } else if (hasStartEnd) {
      const startDate = filters.startDate
        ? DateUtil.startOfDay(new Date(filters.startDate))
        : undefined;
      const endDate = filters.endDate
        ? DateUtil.endOfDay(new Date(filters.endDate))
        : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException(
          'startDate cannot be later than endDate',
        );
      }

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.sale.findMany({
      where,
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
