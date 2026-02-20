import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { ProductCategory } from '../../common/constants/categories.constant';
import { ProductMediaResponseDto } from '../../products/dto/product-response.dto';

export class PublicProductResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'Classic Sneakers' })
  name: string;

  @ApiProperty({
    enum: ProductCategory,
    example: ProductCategory.PERFUMES,
  })
  category: ProductCategory;

  @ApiProperty({ example: 16200 })
  price: number;

  @ApiProperty({ example: 18000 })
  originalPrice: number;

  @ApiPropertyOptional({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  discountType?: DiscountType | null;

  @ApiPropertyOptional({ example: 10 })
  discountValue?: number | null;

  @ApiPropertyOptional({ example: '2026-02-20T10:00:00.000Z' })
  discountStartAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-02-21T10:00:00.000Z' })
  discountEndAt?: Date | null;

  @ApiPropertyOptional({ example: true })
  discountActive?: boolean;

  @ApiPropertyOptional({ example: '2026-02-21T10:00:00.000Z' })
  discountEndsAt?: Date | null;

  @ApiPropertyOptional({ example: 86400 })
  discountRemainingSeconds?: number | null;

  @ApiProperty({ type: [ProductMediaResponseDto] })
  media: ProductMediaResponseDto[];

  @ApiProperty({ example: 14 })
  available: number;

  @ApiProperty({ example: false })
  outOfStock: boolean;
}
