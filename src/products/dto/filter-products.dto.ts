import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from '../../common/constants/categories.constant';

export class FilterProductsDto {
  @ApiPropertyOptional({
    example: 's',
    description: 'Search by product name (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductCategory,
    example: ProductCategory.MEN_SHOES,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
