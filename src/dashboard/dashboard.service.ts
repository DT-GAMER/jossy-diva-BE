// src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DateUtil } from '../common/utils/date.util';
import { OrderStatus } from '../common/constants/order-status.constant';

@Injectable()
export class DashboardService {
  private readonly LOW_STOCK_THRESHOLD = 5;

  constructor(private readonly prisma: PrismaService) {}

  async getTodaySnapshot() {
    const start = DateUtil.startOfDay(new Date());
    const end = DateUtil.endOfDay(new Date());

    // Today’s sales
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalAmount: true,
        profit: true,
      },
    });

    const totalSalesAmount = sales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    const totalProfit = sales.reduce(
      (sum, sale) => sum + sale.profit,
      0,
    );

    const transactions = sales.length;

    // Low stock alerts
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        isArchived: false,
        quantity: {
          lte: this.LOW_STOCK_THRESHOLD,
        },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        reservedQuantity: true,
      },
    });

    const lowStock = lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      available:
        product.quantity - product.reservedQuantity,
    }));

    // Pending website orders
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      today: {
        totalSalesAmount,
        totalProfit,
        transactions,
      },
      lowStockCount: lowStock.length,
      lowStock,
      pendingOrdersCount: pendingOrders.length,
      pendingOrders,
    };
  }
}
