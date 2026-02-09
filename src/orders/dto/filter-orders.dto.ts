import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../common/constants/order-status.constant';

export class FilterOrdersDto {
  @ApiPropertyOptional({
    example: 'JD-20260207-0001',
    description: 'Search by order number or customer name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING_PAYMENT,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'Filter orders created on/after this date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-07',
    description: 'Filter orders created on/before this date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
