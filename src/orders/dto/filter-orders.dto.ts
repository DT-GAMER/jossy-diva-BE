import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../common/constants/order-status.constant';

export class FilterOrdersDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING_PAYMENT,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
