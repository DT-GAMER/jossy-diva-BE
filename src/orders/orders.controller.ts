// src/orders/orders.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { OrderResponseDto } from './dto/order-response.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * WEBSITE: Create order
   */
  @Post()
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ type: OrderResponseDto })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  /**
   * ADMIN: Get all orders
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @Get()
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  findAll(@Query() query: FilterOrdersDto) {
    return this.ordersService.findAll(query.status);
  }

  /**
   * ADMIN: Find by order number
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @Get(':orderNumber')
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  /**
   * ADMIN: Update order status
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @Put(':id/status')
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiOkResponse({ type: OrderResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
