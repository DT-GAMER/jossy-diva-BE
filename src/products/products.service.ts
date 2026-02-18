// src/products/products.service.ts

import {
  BadRequestException,
  Injectable,
  Logger,
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
import { OrderStatus } from '../common/constants/order-status.constant';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

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

  if (validFiles.length > 3) {
    throw new BadRequestException(
      'Maximum of 3 media files allowed per product',
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
}


  async findAll(filters: FilterProductsDto) {
    const where = {
      isArchived: false,
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
  }

  getCategories() {
    return PRODUCT_CATEGORIES;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
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

    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    files: UploadedMediaFile[] = [],
  ) {
    const existingProduct = await this.findOne(id);

    const { files: _ignored, ...updateData } = dto as UpdateProductDto & {
      files?: unknown;
    };

    const validFiles = files.filter((file) => file && file.originalname);

    if (existingProduct.media.length + validFiles.length > 3) {
      throw new BadRequestException(
        'Maximum of 3 media files allowed per product',
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        discountType: updateData.discountType
          ? (updateData.discountType.toUpperCase() as any)
          : undefined,
      },
    });

    for (const file of validFiles) {
      await this.mediaService.uploadProductMedia(id, file);
    }

    return this.prisma.product.findUnique({
      where: { id },
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
  }

  async remove(id: string) {
    this.logger.log(`Attempting to delete product: ${id}`);

    const existingProduct = await this.findOne(id);
    this.logger.log(
      `Product found for deletion: ${existingProduct.id} (${existingProduct.name})`,
    );

    const hasPendingOrder = await this.prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: OrderStatus.PENDING_PAYMENT,
        },
      },
      select: { id: true },
    });

    if (hasPendingOrder) {
      throw new BadRequestException(
        'Cannot archive product with pending orders',
      );
    }

    if (existingProduct.isArchived) {
      this.logger.log(`Product already archived: ${existingProduct.id}`);
      return existingProduct;
    }

    try {
      const archived = await this.prisma.product.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
        },
      });
      this.logger.log(`Archived product: ${archived.id}`);
      return archived;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete product: ${id}. ${message}`,
      );
      throw error;
    }
  }

  /**
   * Used by website (read-only)
   */
  async findVisibleForWebsite() {
    const products = await this.prisma.product.findMany({
      where: {
        visibleOnWebsite: true,
        isArchived: false,
        quantity: {
          gt: 0,
        },
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
