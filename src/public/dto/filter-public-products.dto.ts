import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from '../../common/constants/categories.constant';

export class FilterPublicProductsDto {
  @ApiPropertyOptional({
    example: 'black shoe',
    description:
      'Smart search by product name/description (case-insensitive, multi-word)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductCategory,
    example: ProductCategory.SHOES,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
