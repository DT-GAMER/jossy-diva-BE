import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ProductCategory } from '../../common/constants/categories.constant';

export class FilterProductsDto {
  @ApiPropertyOptional({
    enum: ProductCategory,
    example: ProductCategory.SHOES,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
