// src/jobs/order-cleanup.job.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrderStatus } from '../common/constants/order-status.constant';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderCleanupJob {
  private readonly logger = new Logger(OrderCleanupJob.name);
  private readonly EXPIRY_HOURS: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly configService: ConfigService,
  ) {
    // default: 24 hours
    this.EXPIRY_HOURS =
      this.configService.get<number>(
        'app.orderExpiryHours',
      ) ?? 24;
  }

  /**
   * Runs every 5 minutes
   */
  @Cron('*/5 * * * *')
  async handleExpiredOrders() {
    const expiryTime = new Date(
      Date.now() - this.EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: {
          lt: expiryTime,
        },
      },
      include: {
        items: true,
      },
    });

    if (!expiredOrders.length) {
      return;
    }

    this.logger.log(
      `Found ${expiredOrders.length} expired orders`,
    );

    for (const order of expiredOrders) {
      // Release reserved stock
      for (const item of order.items) {
        await this.inventoryService.releaseReservedStock(
          item.productId,
          item.quantity,
        );
      }

      // Cancel order
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      this.logger.warn(
        `Order ${order.orderNumber} auto-cancelled`,
      );
    }
  }
}
