import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ProductCategory } from '../../common/constants/categories.constant';
import { DiscountType as PrismaDiscountType } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Classic Sneakers' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.MEN_SHOES })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ example: 'Unisex casual sneakers' })
  @IsString()
  description: string;

  @ApiProperty({ example: 12000 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  costPrice: number;

  @ApiProperty({ example: 18000 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sellingPrice: number;

  /* ---------- OPTIONAL DISCOUNT ---------- */

  @ApiPropertyOptional({
    enum: PrismaDiscountType,
    example: PrismaDiscountType.PERCENTAGE,
    description: 'Optional. Must be provided with discountValue.',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;

    const v = value.trim().toUpperCase();
    if (!v) return undefined;

    if (v === 'PERCENTAGE') return PrismaDiscountType.PERCENTAGE;
    if (v === 'FIXED') return PrismaDiscountType.FIXED;

    return value;
  })
  @ValidateIf(
    (o: CreateProductDto) =>
      o.discountType !== undefined ||
      o.discountValue !== undefined,
  )
  @IsEnum(PrismaDiscountType)
  discountType?: PrismaDiscountType;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    description: 'Optional. Must be provided with discountType.',
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  })
  @ValidateIf(
    (o: CreateProductDto) =>
      o.discountType !== undefined ||
      o.discountValue !== undefined,
  )
  @IsInt()
  @Min(1)
  discountValue?: number;

  /* ---------- INVENTORY ---------- */

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  /* ---------- VISIBILITY ---------- */

  @ApiProperty({ example: true })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.toLowerCase() === 'true'
      : value,
  )
  @IsBoolean()
  visibleOnWebsite: boolean;
}
