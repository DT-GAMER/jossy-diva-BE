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
  @IsInt()
  @IsPositive()
  costPrice: number;

  @ApiProperty({ example: 18000, minimum: 1 })
  @IsInt()
  @IsPositive()
  sellingPrice: number;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'], example: 'percentage' })
  @IsOptional()
  @IsEnum(['percentage', 'fixed'])
  discountType?: 'percentage' | 'fixed';

  @ApiPropertyOptional({ example: 10, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  discountValue?: number;

  @ApiProperty({ example: 30, minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  visibleOnWebsite: boolean;
}
