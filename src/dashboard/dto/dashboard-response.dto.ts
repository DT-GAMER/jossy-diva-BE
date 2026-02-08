import { ApiProperty } from '@nestjs/swagger';

export class TodaySnapshotDto {
  @ApiProperty({ example: 125000 })
  totalSalesAmount: number;

  @ApiProperty({ example: 42000 })
  totalProfit: number;

  @ApiProperty({ example: 8 })
  transactions: number;
}

export class LowStockItemDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'Classic Sneakers' })
  name: string;

  @ApiProperty({ example: 3 })
  available: number;
}

export class PendingOrderItemDto {
  @ApiProperty({ example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e' })
  id: string;

  @ApiProperty({ example: 'JDC-20260207-0001' })
  orderNumber: string;

  @ApiProperty({ example: 'Jane Doe' })
  customerName: string;

  @ApiProperty({ example: 36000 })
  totalAmount: number;

  @ApiProperty({ example: '2026-02-07T14:00:00.000Z' })
  createdAt: Date;
}

export class DashboardResponseDto {
  @ApiProperty({ type: TodaySnapshotDto })
  today: TodaySnapshotDto;

  @ApiProperty({ example: 4 })
  lowStockCount: number;

  @ApiProperty({ type: [LowStockItemDto] })
  lowStock: LowStockItemDto[];

  @ApiProperty({ example: 6 })
  pendingOrdersCount: number;

  @ApiProperty({ type: [PendingOrderItemDto] })
  pendingOrders: PendingOrderItemDto[];
}
