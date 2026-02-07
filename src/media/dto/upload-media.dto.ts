import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaDto {
  @ApiProperty({
    format: 'uuid',
    example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e',
    description: 'Product ID to attach media to',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Media file (image or video)',
  })
  file: any;
}
