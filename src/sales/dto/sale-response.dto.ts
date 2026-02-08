import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, SaleSource } from '@prisma/client';

export class SaleItemResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  saleId: string;

  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 18000 })
  sellingPrice: number;

  @ApiProperty({ example: 12000 })
  costPrice: number;
}

export class SaleResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ enum: SaleSource, example: SaleSource.WALK_IN })
  source: SaleSource;

  @ApiPropertyOptional({ example: 'JDC-20260207-0001' })
  orderNumber?: string | null;

  @ApiProperty({ example: 36000 })
  totalAmount: number;

  @ApiProperty({ example: 12000 })
  profit: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [SaleItemResponseDto] })
  items: SaleItemResponseDto[];

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  createdAt: Date;
}
