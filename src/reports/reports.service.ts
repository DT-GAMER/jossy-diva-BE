// src/reports/reports.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DateUtil } from '../common/utils/date.util';
import { SaleSource } from '../common/constants/sale-source.constant';
import { ReportRangeDto } from './dto/report-range.dto';
import { PdfGenerator } from '../pdf/pdf';
import { generateReportHTML } from './templates/report-html';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * DAILY REPORT (today)
   */
  async getDailyReport() {
    const start = DateUtil.startOfDay(new Date());
    const end = DateUtil.endOfDay(new Date());

    return this.buildReport(start, end);
  }

  /**
   * WEEKLY REPORT (last 7 days)
   */
  async getWeeklyReport() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);

    return this.buildReport(
      DateUtil.startOfDay(start),
      DateUtil.endOfDay(end),
    );
  }

  /**
   * MONTHLY REPORT (current month)
   */
  async getMonthlyReport() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return this.buildReport(start, end);
  }

  /**
   * CUSTOM REPORT (date range)
   */
  async getCustomReport(range: ReportRangeDto) {
    const start = DateUtil.startOfDay(new Date(range.startDate));
    const end = DateUtil.endOfDay(new Date(range.endDate));

    if (start > end) {
      throw new BadRequestException(
        'startDate cannot be later than endDate',
      );
    }

    return this.buildReport(start, end);
  }

  async exportCustomReportPdf(range: ReportRangeDto) {
    const start = DateUtil.startOfDay(new Date(range.startDate));
    const end = DateUtil.endOfDay(new Date(range.endDate));

    if (start > end) {
      throw new BadRequestException(
        'startDate cannot be later than endDate',
      );
    }

    const report = await this.buildReport(start, end);
    const title = 'Custom Sales Report';
    const dateRange = `${range.startDate} to ${range.endDate}`;
    const generatedAt = new Date().toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const html = generateReportHTML({
      title,
      dateRange,
      generatedAt,
      report,
    });

    return PdfGenerator.generatePdf({ html });
  }

  /**
   * CORE REPORT BUILDER
   */
  private async buildReport(start: Date, end: Date) {
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let revenue = 0;
    let profit = 0;

    const byCategory: Record<
      string,
      { revenue: number; profit: number }
    > = {};

    const bySource: Record<
      SaleSource,
      { revenue: number; profit: number }
    > = {
      [SaleSource.WALK_IN]: { revenue: 0, profit: 0 },
      [SaleSource.WEBSITE]: { revenue: 0, profit: 0 },
    };

    for (const sale of sales) {
      revenue += sale.totalAmount;
      profit += sale.profit;

      // Source breakdown
      bySource[sale.source].revenue += sale.totalAmount;
      bySource[sale.source].profit += sale.profit;

      // Category breakdown
      for (const item of sale.items) {
        const category = item.product.category;

        if (!byCategory[category]) {
          byCategory[category] = {
            revenue: 0,
            profit: 0,
          };
        }

        byCategory[category].revenue +=
          item.sellingPrice * item.quantity;

        byCategory[category].profit +=
          (item.sellingPrice - item.costPrice) *
          item.quantity;
      }
    }

    const profitMargin =
      revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      profit,
      profitMargin,
      byCategory,
      bySource,
      transactions: sales.length,
    };
  }

  // Legacy plain-text PDF builder removed in favor of HTML template
}
