// src/inventory/inventory.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available stock for a product
   */
  async getAvailableStock(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.quantity - product.reservedQuantity;
  }

  /**
   * Ensure stock is available
   */
  async assertAvailability(productId: string, quantity: number) {
    const available = await this.getAvailableStock(productId);

    if (available < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${available} left.`,
      );
    }
  }

  /**
   * Reserve stock (WEBSITE ORDER)
   */
  async reserveStock(productId: string, quantity: number) {
    await this.assertAvailability(productId, quantity);

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        reservedQuantity: {
          increment: quantity,
        },
      },
    });
  }

  /**
   * Release reserved stock (ORDER CANCEL / EXPIRE)
   */
  async releaseReservedStock(productId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        reservedQuantity: {
          decrement: quantity,
        },
      },
    });
  }

  /**
   * Deduct stock immediately (WALK-IN SALE)
   */
  async deductStock(productId: string, quantity: number) {
    await this.assertAvailability(productId, quantity);

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  /**
   * Convert reserved stock to deducted stock (ORDER PAID)
   */
  async finalizeReservedStock(productId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        reservedQuantity: {
          decrement: quantity,
        },
        quantity: {
          decrement: quantity,
        },
      },
    });
  }
}
