import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class CreateProductWithMediaDto extends CreateProductDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Optional product media files (max 3)',
  })
  files?: any[];
}
