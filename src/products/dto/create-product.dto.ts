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

export class CreateProductDto {
  @ApiProperty({ example: 'Classic Sneakers' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.SHOES })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ example: 'Unisex casual sneakers with breathable fabric' })
  @IsString()
  description: string;

  @ApiProperty({ example: 12000, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  costPrice: number;

  @ApiProperty({ example: 18000, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sellingPrice: number;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'], example: 'percentage' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === '' ? undefined : normalized;
  })
  @ValidateIf(
    (o: CreateProductDto) =>
      o.discountType !== undefined ||
      o.discountValue !== undefined,
  )
  @IsEnum(['percentage', 'fixed'])
  discountType?: 'percentage' | 'fixed';

  @ApiPropertyOptional({ example: 10, minimum: 1 })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'string') {
      const normalized = value.trim();
      if (!normalized) {
        return undefined;
      }
      const parsed = Number(normalized);
      return Number.isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  @ValidateIf(
    (o: CreateProductDto) =>
      o.discountType !== undefined ||
      o.discountValue !== undefined,
  )
  @IsInt()
  @Min(1)
  discountValue?: number;

  @ApiProperty({ example: 30, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: true })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  @IsBoolean()
  visibleOnWebsite: boolean;
}
