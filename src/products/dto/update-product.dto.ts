import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '../../common/constants/categories.constant';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Classic Sneakers' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated product description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: ProductCategory, example: ProductCategory.SHOES })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ example: 20000, minimum: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  sellingPrice?: number;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'], example: 'fixed' })
  @IsOptional()
  @IsEnum(['percentage', 'fixed'])
  discountType?: 'percentage' | 'fixed';

  @ApiPropertyOptional({ example: 1000, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  discountValue?: number;

  @ApiPropertyOptional({ example: 25, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  visibleOnWebsite?: boolean;
}
