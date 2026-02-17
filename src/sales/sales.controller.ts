// src/sales/sales.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { FilterSalesDto } from './dto/filter-sales.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'sales', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  /**
   * Create a sale (walk-in)
   */
  @Post()
  @ApiBody({ type: CreateSaleDto })
  @ApiCreatedResponse({ type: SaleResponseDto })
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.createSale(dto);
  }

  /**
   * Get all sales
   */
  @Get()
  @ApiOkResponse({ type: SaleResponseDto, isArray: true })
  findAll(@Query() query: FilterSalesDto) {
    return this.salesService.findAll(query);
  }
}
