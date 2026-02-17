import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../../common/constants/categories.constant';
import { ProductMediaResponseDto } from '../../products/dto/product-response.dto';

export class PublicProductResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'Classic Sneakers' })
  name: string;

  @ApiProperty({
    enum: ProductCategory,
    example: ProductCategory.MEN_SHOES,
  })
  category: ProductCategory;

  @ApiProperty({ example: 16200 })
  price: number;

  @ApiProperty({ example: 18000 })
  originalPrice: number;

  @ApiProperty({ type: [ProductMediaResponseDto] })
  media: ProductMediaResponseDto[];

  @ApiProperty({ example: 14 })
  available: number;

  @ApiProperty({ example: false })
  outOfStock: boolean;
}
