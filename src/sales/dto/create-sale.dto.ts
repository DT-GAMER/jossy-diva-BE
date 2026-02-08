// src/sales/dto/create-sale.dto.ts

import {
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class SaleItemDto {
  @ApiProperty({
    format: 'uuid',
    example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e',
  })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 18000, minimum: 0 })
  @IsInt()
  @Min(0)
  sellingPrice: number;
}

export class CreateSaleDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
