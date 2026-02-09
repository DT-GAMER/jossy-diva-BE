import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ProductCategory } from '../../common/constants/categories.constant';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Classic Sneakers' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductCategory, example: ProductCategory.SHOES })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ example: 20000, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sellingPrice?: number;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'], example: 'fixed' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === '' ? undefined : normalized;
  })
  @ValidateIf(
    (o: UpdateProductDto) =>
      o.discountType !== undefined ||
      o.discountValue !== undefined,
  )
  @IsEnum(['percentage', 'fixed'])
  discountType?: 'percentage' | 'fixed';

  @ApiPropertyOptional({ example: 1000, minimum: 1 })
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
    (o: UpdateProductDto) =>
      o.discountType !== undefined ||
      o.discountValue !== undefined,
  )
  @IsInt()
  @Min(1)
  discountValue?: number;

  @ApiPropertyOptional({ example: 25, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
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
  visibleOnWebsite?: boolean;
}
