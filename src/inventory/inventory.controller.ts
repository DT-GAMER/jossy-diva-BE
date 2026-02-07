// src/inventory/inventory.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Version } from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'inventory', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Get available stock for a product
   */
  @Get(':productId/available')
  async getAvailable(@Param('productId') productId: string) {
    const available = await this.inventoryService.getAvailableStock(
      productId,
    );

    return { available };
  }
}
