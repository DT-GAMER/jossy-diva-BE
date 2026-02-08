// src/products/products.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PriceUtil } from '../common/utils/price.util';
import {
  ProductCategory,
  PRODUCT_CATEGORIES,
} from '../common/constants/categories.constant';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        costPrice: dto.costPrice,
        sellingPrice: dto.sellingPrice,
        discountType: dto.discountType?.toUpperCase() as any,
        discountValue: dto.discountValue,
        quantity: dto.quantity,
        visibleOnWebsite: dto.visibleOnWebsite,
      },
    });
  }

  async findAll(filters: FilterProductsDto) {
    const where = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search
        ? {
            name: {
              contains: filters.search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    return this.prisma.product.findMany({
      where,
      include: {
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getCategories() {
    return PRODUCT_CATEGORIES;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        discountType: dto.discountType
          ? (dto.discountType.toUpperCase() as any)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Used by website (read-only)
   */
  async findVisibleForWebsite() {
    const products = await this.prisma.product.findMany({
      where: {
        visibleOnWebsite: true,
        quantity: {
          gt: 0,
        },
      },
      include: {
        media: true,
      },
    });

    return products.map((product) => ({
      ...product,
      discountedPrice: PriceUtil.calculateDiscountedPrice(
        product.sellingPrice,
        product.discountType?.toLowerCase() as any,
        product.discountValue ?? undefined,
      ),
    }));
  }
}
