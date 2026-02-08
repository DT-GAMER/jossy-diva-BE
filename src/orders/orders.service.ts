// src/orders/orders.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, SaleSource, type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { OrderStatus } from '../common/constants/order-status.constant';
import { OrderNumberUtil } from '../common/utils/order-number.util';
import { DateUtil } from '../common/utils/date.util';
import { PriceUtil } from 'src/common/utils/price.util';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
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
      'JDC',
      today,
      countToday + 1,
    );

    // Calculate total
    let totalAmount = 0;

    const itemsWithPrice: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      totalAmount += product.sellingPrice * item.quantity;

      itemsWithPrice.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtOrder: product.sellingPrice,
      });
    }

    // Create order
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

    if (filters.startDate || filters.endDate) {
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

    return this.prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
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

  // 🚫 Prevent invalid transitions
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

  // PAID → AUTO CREATE SALE
  if (status === OrderStatus.PAID) {
    let totalAmount = 0;
    let totalProfit = 0;

    const saleItems: Prisma.SaleItemUncheckedCreateWithoutSaleInput[] = [];

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

    // Create sale automatically
    await this.prisma.sale.create({
      data: {
        source: SaleSource.WEBSITE,
        orderNumber: order.orderNumber,
        totalAmount,
        profit: totalProfit,
        paymentMethod: PaymentMethod.TRANSFER,
        items: {
          create: saleItems,
        },
      },
    });

    // Mark order completed
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED },
    });
  }

  throw new BadRequestException('Invalid order status');
}
}
