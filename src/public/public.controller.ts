// src/public/public.controller.ts

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Version } from '@nestjs/common';

import { PublicService } from './public.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { FilterPublicProductsDto } from './dto/filter-public-products.dto';
import { ProductCategory } from '../common/constants/categories.constant';
import { PublicProductResponseDto } from './dto/public-product-response.dto';

@ApiTags('Public')
@Controller({ path: 'public', version: '1' })
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * Website: list products
   */
  @Get('products')
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'black shoe',
  })
  @ApiQuery({
    name: 'category',
    enum: ProductCategory,
    required: false,
  })
  @ApiOkResponse({
    type: PublicProductResponseDto,
    isArray: true,
  })
  getProducts(@Query() query: FilterPublicProductsDto) {
    return this.publicService.getProducts(query);
  }

  /**
   * Website: create order
   */
  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.publicService.createOrder(dto);
  }
}
