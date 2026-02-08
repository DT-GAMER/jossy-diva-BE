// src/dashboard/dashboard.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'dashboard', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOkResponse({ type: DashboardResponseDto })
  getDashboard() {
    return this.dashboardService.getTodaySnapshot();
  }
}
