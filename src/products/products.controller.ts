// src/products/products.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductCategory } from '../common/constants/categories.constant';
import type { UploadedMediaFile } from '../media/types/uploaded-media-file.type';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(CreateProductDto, UpdateProductDto)
@Controller({ path: 'products', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateProductDto) },
        {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
              description: 'Optional product media files (max 2)',
            },
          },
        },
      ],
    },
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @UseInterceptors(FilesInterceptor('files', 2))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files?: UploadedMediaFile[],
  ) {
    return this.productsService.create(dto, files ?? []);
  }


  @Get()
  @ApiQuery({
    name: 'search',
    required: false,
    example: 's',
  })
  @ApiQuery({
    name: 'category',
    enum: ProductCategory,
    required: false,
  })
  @ApiOkResponse({ type: ProductResponseDto, isArray: true })
  findAll(@Query() query: FilterProductsDto) {
    return this.productsService.findAll(query);
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateProductDto) },
        {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
              description:
                'Optional new media files to add (max 2 total per product)',
            },
          },
        },
      ],
    },
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @UseInterceptors(FilesInterceptor('files', 2))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: UploadedMediaFile[],
  ) {
    return this.productsService.update(id, dto, files ?? []);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateProductDto) },
        {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
              description:
                'Optional new media files to add (max 2 total per product)',
            },
          },
        },
      ],
    },
  })
  @ApiOkResponse({ type: ProductResponseDto })
  @UseInterceptors(FilesInterceptor('files', 2))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  patchUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: UploadedMediaFile[],
  ) {
    return this.productsService.update(id, dto, files ?? []);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
