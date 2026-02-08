// src/reports/reports.controller.ts

import {
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportRangeDto } from './dto/report-range.dto';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard)
@AdminOnly()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @ApiOkResponse({ type: ReportResponseDto })
  daily() {
    return this.reportsService.getDailyReport();
  }

  @Get('weekly')
  @ApiOkResponse({ type: ReportResponseDto })
  weekly() {
    return this.reportsService.getWeeklyReport();
  }

  @Get('monthly')
  @ApiOkResponse({ type: ReportResponseDto })
  monthly() {
    return this.reportsService.getMonthlyReport();
  }

  @Get('custom')
  @ApiQuery({ name: 'startDate', required: true, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-02-07' })
  @ApiOkResponse({ type: ReportResponseDto })
  custom(@Query() query: ReportRangeDto) {
    return this.reportsService.getCustomReport(query);
  }

  @Get('export/pdf')
  @ApiQuery({ name: 'startDate', required: true, example: '2026-02-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-02-07' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    schema: { type: 'string', format: 'binary' },
    description: 'PDF file stream',
  })
  async exportPdf(
    @Query() query: ReportRangeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdf = await this.reportsService.exportCustomReportPdf(query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${query.startDate}-to-${query.endDate}.pdf"`,
    );
    return new StreamableFile(pdf);
  }
}
