// src/orders/orders.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PaymentMethod, SaleSource, type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { OrderStatus } from '../common/constants/order-status.constant';
import { OrderNumberUtil } from '../common/utils/order-number.util';
import { DateUtil } from '../common/utils/date.util';
import { PriceUtil } from '../common/utils/price.util';
import { ReceiptsService } from '../reciepts/reciepts.service';
import { ReceiptNumberUtil } from 'src/utils/reciept-number.util';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  /**
   * Create website order
   */
  async createOrder(dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Validate and reserve stock first
    for (const item of dto.items) {
      await this.inventoryService.assertAvailability(
        item.productId,
        item.quantity,
      );
    }

    for (const item of dto.items) {
      await this.inventoryService.reserveStock(
        item.productId,
        item.quantity,
      );
    }

    // Generate order number
    const today = DateUtil.now();
    const countToday = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: DateUtil.startOfDay(today),
          lte: DateUtil.endOfDay(today),
        },
      },
    });

    const orderNumber = OrderNumberUtil.generate(
      'JD',
      today,
      countToday + 1,
    );

    let totalAmount = 0;

    const itemsWithPrice: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] =
      [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const effectivePrice = PriceUtil.calculateDiscountedPrice(
        product.sellingPrice,
        product.discountType?.toLowerCase() as any,
        product.discountValue ?? undefined,
        product.discountStartAt,
        product.discountEndAt,
      );

      totalAmount += effectivePrice * item.quantity;

      itemsWithPrice.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtOrder: effectivePrice,
      });
    }

    return this.prisma.order.create({
      data: {
        orderNumber,
        customerName: dto.customerName,
        phone: dto.phone,
        totalAmount,
        status: OrderStatus.PENDING_PAYMENT,
        items: {
          create: itemsWithPrice,
        },
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        'Only pending orders can be updated',
      );
    }

    // ❌ CANCELLED → release stock
    if (status === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.inventoryService.releaseReservedStock(
          item.productId,
          item.quantity,
        );
      }

      return this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    }

    // ✅ PAID → AUTO CREATE SALE + RECEIPT
    if (status === OrderStatus.PAID) {
      let totalAmount = 0;
      let totalProfit = 0;

      const saleItems: Prisma.SaleItemUncheckedCreateWithoutSaleInput[] =
        [];

      for (const item of order.items) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        // Finalize reserved stock
        await this.inventoryService.finalizeReservedStock(
          product.id,
          item.quantity,
        );

        const profit = PriceUtil.calculateProfit(
          product.costPrice,
          item.priceAtOrder,
          item.quantity,
        );

        totalAmount += item.priceAtOrder * item.quantity;
        totalProfit += profit;

        saleItems.push({
          productId: product.id,
          quantity: item.quantity,
          sellingPrice: item.priceAtOrder,
          costPrice: product.costPrice,
        });
      }

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
          source: SaleSource.WEBSITE,
          orderNumber: order.orderNumber,
          totalAmount,
          profit: totalProfit,
          paymentMethod: PaymentMethod.TRANSFER,
          items: {
            create: saleItems,
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
            `Failed to generate receipt for website sale ${sale.id}`,
            error,
          );
        });

      // 3️⃣ Mark order paid
      return this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
    }

    throw new BadRequestException('Invalid order status');
  }

  /**
   * Get all orders (admin)
   */
  async findAll(filters: FilterOrdersDto) {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        {
          orderNumber: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          customerName: {
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

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.product?.name ?? '',
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
      })),
    }));
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.product?.name ?? '',
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
      })),
    };
  }
}
