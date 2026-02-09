// src/products/products.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PriceUtil } from '../common/utils/price.util';
import {
  ProductCategory,
  PRODUCT_CATEGORIES,
} from '../common/constants/categories.constant';
import { MediaService } from '../media/media.service';
import type { UploadedMediaFile } from '../media/types/uploaded-media-file.type';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(
  dto: CreateProductDto,
  files: UploadedMediaFile[] = [],
) {
  // 🛑 Filter out empty file placeholders (safety)
  const validFiles = files.filter(
    (f) => f && f.originalname,
  );

  if (validFiles.length > 2) {
    throw new BadRequestException(
      'Maximum of 2 media files allowed per product',
    );
  }

  // 🛑 Enforce discount consistency (final safety net)
  const hasDiscountType = dto.discountType !== undefined;
  const hasDiscountValue = dto.discountValue !== undefined;

  if (hasDiscountType !== hasDiscountValue) {
    throw new BadRequestException(
      'Both discountType and discountValue must be provided together',
    );
  }

  const product = await this.prisma.product.create({
    data: {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      discountType: dto.discountType, // ✅ trust DTO
      discountValue: dto.discountValue,
      quantity: dto.quantity,
      visibleOnWebsite: dto.visibleOnWebsite,
    },
    include: {
      media: true,
    },
  });

  if (!validFiles.length) {
    return product;
  }

  for (const file of validFiles) {
    await this.mediaService.uploadProductMedia(
      product.id,
      file,
    );
  }

  return this.prisma.product.findUnique({
    where: { id: product.id },
    include: {
      media: true,
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

  async update(
    id: string,
    dto: UpdateProductDto,
    files: UploadedMediaFile[] = [],
  ) {
    const existingProduct = await this.findOne(id);

    if (existingProduct.media.length + files.length > 2) {
      throw new BadRequestException(
        'Maximum of 2 media files allowed per product',
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        discountType: dto.discountType
          ? (dto.discountType.toUpperCase() as any)
          : undefined,
      },
    });

    for (const file of files) {
      await this.mediaService.uploadProductMedia(id, file);
    }

    return this.prisma.product.findUnique({
      where: { id },
      include: { media: true },
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
