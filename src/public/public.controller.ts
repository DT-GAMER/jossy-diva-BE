// src/public/public.controller.ts

import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';

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
   * Website: get product by id
   */
  @Get('products/:id')
  @ApiParam({
    name: 'id',
    example: '0b9a1f5e-3d61-466d-a5a4-302712f3bb0e',
  })
  @ApiOkResponse({ type: PublicProductResponseDto })
  getProductById(@Param('id') id: string) {
    return this.publicService.getProductById(id);
  }

  /**
   * Website: create order
   */
  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.publicService.createOrder(dto);
  }
}
