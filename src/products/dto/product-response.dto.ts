import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, ProductCategory } from '@prisma/client';

export class ProductMediaResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/x.jpg' })
  url: string;

  @ApiProperty({ example: 'IMAGE' })
  type: string;

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  createdAt: Date;
}

export class ProductResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'Classic Sneakers' })
  name: string;

  @ApiProperty({ example: 'Unisex casual sneakers with breathable fabric' })
  description: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.SHOES })
  category: ProductCategory;

  @ApiProperty({ example: 12000 })
  costPrice: number;

  @ApiProperty({ example: 18000 })
  sellingPrice: number;

  @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  discountType?: DiscountType | null;

  @ApiPropertyOptional({ example: 10 })
  discountValue?: number | null;

  @ApiProperty({ example: 30 })
  quantity: number;

  @ApiProperty({ example: 0 })
  reservedQuantity: number;

  @ApiProperty({ example: true })
  visibleOnWebsite: boolean;

  @ApiPropertyOptional({ type: [ProductMediaResponseDto] })
  media?: ProductMediaResponseDto[];

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  updatedAt: Date;
}
