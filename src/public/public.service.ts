// src/public/public.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { PriceUtil } from '../common/utils/price.util';
import { FilterPublicProductsDto } from './dto/filter-public-products.dto';
import { UserRole } from '../common/constants/roles.constant';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Get products visible on website
   */
  async getProducts(filters: FilterPublicProductsDto) {
    const where: Prisma.ProductWhereInput = {
      visibleOnWebsite: true,
      isArchived: false,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    const searchTerm = filters.search?.trim();
    if (searchTerm) {
      const tokens = searchTerm
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);

      if (tokens.length) {
        where.AND = tokens.map((token) => ({
          OR: [
            {
              name: {
                contains: token,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: token,
                mode: 'insensitive',
              },
            },
          ],
        }));
      }
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        media: {
          select: {
            id: true,
            productId: true,
            url: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map((product) => {
      const discountMeta = PriceUtil.getDiscountCountdown(
        product.discountStartAt,
        product.discountEndAt,
      );

      const response: Record<string, any> = {
        id: product.id,
        name: product.name,
        category: product.category,
        price: PriceUtil.calculateDiscountedPrice(
          product.sellingPrice,
          product.discountType?.toLowerCase() as any,
          product.discountValue ?? undefined,
          product.discountStartAt,
          product.discountEndAt,
        ),
        originalPrice: product.sellingPrice,
        discountStartAt: product.discountStartAt,
        discountEndAt: product.discountEndAt,
        discountActive: discountMeta.active,
        discountEndsAt: discountMeta.endsAt,
        discountRemainingSeconds: discountMeta.remainingSeconds,
        media: product.media,
        available: product.quantity - product.reservedQuantity,
        outOfStock: product.quantity - product.reservedQuantity <= 0,
      };

      if (discountMeta.active) {
        response.discountType = product.discountType;
        response.discountValue = product.discountValue;
      }

      return response;
    });
  }

  /**
   * Get a single product visible on website
   */
  async getProductById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        visibleOnWebsite: true,
        isArchived: false,
      },
      include: {
        media: {
          select: {
            id: true,
            productId: true,
            url: true,
            type: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const discountMeta = PriceUtil.getDiscountCountdown(
      product.discountStartAt,
      product.discountEndAt,
    );

    const response: Record<string, any> = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: PriceUtil.calculateDiscountedPrice(
        product.sellingPrice,
        product.discountType?.toLowerCase() as any,
        product.discountValue ?? undefined,
        product.discountStartAt,
        product.discountEndAt,
      ),
      originalPrice: product.sellingPrice,
      discountStartAt: product.discountStartAt,
      discountEndAt: product.discountEndAt,
      discountActive: discountMeta.active,
      discountEndsAt: discountMeta.endsAt,
      discountRemainingSeconds: discountMeta.remainingSeconds,
      media: product.media,
      available: product.quantity - product.reservedQuantity,
      outOfStock: product.quantity - product.reservedQuantity <= 0,
    };

    if (discountMeta.active) {
      response.discountType = product.discountType;
      response.discountValue = product.discountValue;
    }

    return response;
  }

  /**
   * Create website order
   * Delegates to OrdersService
   */
  async createOrder(payload: any) {
    return this.ordersService.createOrder(payload);
  }

  /**
   * Get public account details (admin)
   */
  async getAccountDetails() {
    const user = await this.prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN,
      },
      select: {
        bankName: true,
        accountName: true,
        accountNumber: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Account details not found');
    }

    return user;
  }
}
