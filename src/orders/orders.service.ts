// src/orders/orders.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '../common/constants/order-status.constant';
import { OrderNumberUtil } from '../common/utils/order-number.util';
import { DateUtil } from '../common/utils/date.util';

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
  async findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
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
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Handle cancellation → release stock
    if (
      status === OrderStatus.CANCELLED &&
      order.status === OrderStatus.PENDING_PAYMENT
    ) {
      for (const item of order.items) {
        await this.inventoryService.releaseReservedStock(
          item.productId,
          item.quantity,
        );
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
