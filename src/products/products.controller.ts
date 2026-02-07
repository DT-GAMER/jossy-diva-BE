// src/products/products.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductCategory } from '../common/constants/categories.constant';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'products', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductResponseDto })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiQuery({
    name: 'category',
    enum: ProductCategory,
    required: false,
  })
  @ApiOkResponse({ type: ProductResponseDto, isArray: true })
  findAll(@Query() query: FilterProductsDto) {
    return this.productsService.findAll(query.category);
  }

  @Get('categories')
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { type: 'string', enum: Object.values(ProductCategory) },
      example: Object.values(ProductCategory),
    },
  })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ type: ProductResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
