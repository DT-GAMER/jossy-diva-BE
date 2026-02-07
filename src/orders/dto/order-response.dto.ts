import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, SaleSource } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  orderId: string;

  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 18000 })
  priceAtOrder: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'JDC-20260207-0001' })
  orderNumber: string;

  @ApiProperty({ example: 'Jane Doe' })
  customerName: string;

  @ApiProperty({ example: '+2348012345678' })
  phone: string;

  @ApiProperty({ example: 36000 })
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @ApiProperty({ enum: SaleSource, example: SaleSource.WEBSITE })
  source: SaleSource;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  updatedAt: Date;
}
