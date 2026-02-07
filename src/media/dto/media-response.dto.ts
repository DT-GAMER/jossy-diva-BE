import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class MediaResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  productId: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/x.jpg' })
  url: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  type: MediaType;

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  createdAt: Date;
}
