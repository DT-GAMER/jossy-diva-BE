// src/reports/reports.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DateUtil } from '../common/utils/date.util';
import { SaleSource } from '../common/constants/sale-source.constant';
import { ReportRangeDto } from './dto/report-range.dto';

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
    return this.buildSimplePdfBuffer(
      `Custom Report (${range.startDate} to ${range.endDate})`,
      report,
    );
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

  private buildSimplePdfBuffer(
    title: string,
    report: {
      revenue: number;
      profit: number;
      profitMargin: number;
      transactions: number;
      bySource: Record<SaleSource, { revenue: number; profit: number }>;
      byCategory: Record<string, { revenue: number; profit: number }>;
    },
  ) {
    const lines = [
      title,
      '',
      `Revenue: ${report.revenue}`,
      `Profit: ${report.profit}`,
      `Profit Margin: ${report.profitMargin.toFixed(2)}%`,
      `Transactions: ${report.transactions}`,
      '',
      'By Source:',
      ...Object.entries(report.bySource).map(
        ([source, data]) =>
          `- ${source}: revenue=${data.revenue}, profit=${data.profit}`,
      ),
      '',
      'By Category:',
      ...Object.entries(report.byCategory).map(
        ([category, data]) =>
          `- ${category}: revenue=${data.revenue}, profit=${data.profit}`,
      ),
    ];

    const escapedLines = lines.map((line) =>
      line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
    );

    const textCommands = escapedLines
      .map((line, index) => {
        const y = 780 - index * 18;
        return `1 0 0 1 50 ${y} Tm (${line}) Tj`;
      })
      .join('\n');

    const stream = `BT
/F1 12 Tf
${textCommands}
ET`;

    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
      `5 0 obj\n<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream\nendobj\n`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];

    for (const obj of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += obj;
    }

    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
${offsets
  .slice(1)
  .map((offset) => `${offset.toString().padStart(10, '0')} 00000 n `)
  .join('\n')}
trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;

    return Buffer.from(pdf, 'utf8');
  }
}
