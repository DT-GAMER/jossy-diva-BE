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
  const hasDiscountStart = dto.discountStartAt !== undefined;
  const hasDiscountEnd = dto.discountEndAt !== undefined;

  if (hasDiscountType !== hasDiscountValue) {
    throw new BadRequestException(
      'Both discountType and discountValue must be provided together',
    );
  }

  if ((hasDiscountStart || hasDiscountEnd) && !hasDiscountType) {
    throw new BadRequestException(
      'discountType and discountValue are required when setting discount dates',
    );
  }

  const discountStartAt = hasDiscountStart
    ? new Date(dto.discountStartAt as string)
    : undefined;
  const discountEndAt = hasDiscountEnd
    ? new Date(dto.discountEndAt as string)
    : undefined;

  if (
    discountStartAt &&
    discountEndAt &&
    discountStartAt > discountEndAt
  ) {
    throw new BadRequestException(
      'discountStartAt cannot be later than discountEndAt',
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
      discountStartAt,
      discountEndAt,
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
    return this.decorateProductWithDiscount(product);
  }

  for (const file of validFiles) {
    await this.mediaService.uploadProductMedia(
      product.id,
      file,
    );
  }

  const created = await this.prisma.product.findUnique({
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

  if (!created) {
    throw new NotFoundException('Product not found');
  }

  return this.decorateProductWithDiscount(created);
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

    return products.map((product) =>
      this.decorateProductWithDiscount(product),
    );
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

    return this.decorateProductWithDiscount(product);
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

    const hasDiscountStart = updateData.discountStartAt !== undefined;
    const hasDiscountEnd = updateData.discountEndAt !== undefined;

    if ((hasDiscountStart || hasDiscountEnd) && !updateData.discountType) {
      throw new BadRequestException(
        'discountType and discountValue are required when setting discount dates',
      );
    }

    const discountStartAt = hasDiscountStart
      ? new Date(updateData.discountStartAt as string)
      : undefined;
    const discountEndAt = hasDiscountEnd
      ? new Date(updateData.discountEndAt as string)
      : undefined;

    if (
      discountStartAt &&
      discountEndAt &&
      discountStartAt > discountEndAt
    ) {
      throw new BadRequestException(
        'discountStartAt cannot be later than discountEndAt',
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        discountType: updateData.discountType
          ? (updateData.discountType.toUpperCase() as any)
          : undefined,
        discountStartAt,
        discountEndAt,
      },
    });

    for (const file of validFiles) {
      await this.mediaService.uploadProductMedia(id, file);
    }

    const updated = await this.prisma.product.findUnique({
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

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return this.decorateProductWithDiscount(updated);
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
      ...this.decorateProductWithDiscount(product),
      discountedPrice: PriceUtil.calculateDiscountedPrice(
        product.sellingPrice,
        product.discountType?.toLowerCase() as any,
        product.discountValue ?? undefined,
        product.discountStartAt,
        product.discountEndAt,
      ),
    }));
  }

  private decorateProductWithDiscount<
    T extends { discountStartAt?: Date | null; discountEndAt?: Date | null }
  >(product: T): T & {
    discountActive: boolean;
    discountEndsAt: Date | null;
    discountRemainingSeconds: number | null;
  } {
    const meta = PriceUtil.getDiscountCountdown(
      product.discountStartAt,
      product.discountEndAt,
    );

    return {
      ...product,
      discountActive: meta.active,
      discountEndsAt: meta.endsAt,
      discountRemainingSeconds: meta.remainingSeconds,
    };
  }
}
