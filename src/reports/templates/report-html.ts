import { REPORT_CSS } from './report-css';
import type { SaleSource } from '../../common/constants/sale-source.constant';

export interface ReportPdfData {
  title: string;
  dateRange: string;
  generatedAt: string;
  report: {
    revenue: number;
    profit: number;
    profitMargin: number;
    transactions: number;
    bySource: Record<SaleSource, { revenue: number; profit: number }>;
    byCategory: Record<string, { revenue: number; profit: number }>;
  };
}

export function generateReportHTML(data: ReportPdfData): string {
  const { report } = data;
  const bySourceRows = Object.entries(report.bySource)
    .map(
      ([source, value]) => `
        <tr>
          <td>${source}</td>
          <td class="amount">₦${value.revenue.toLocaleString()}</td>
          <td>₦${value.profit.toLocaleString()}</td>
        </tr>
      `,
    )
    .join('');

  const byCategoryRows = Object.entries(report.byCategory)
    .map(
      ([category, value]) => `
        <tr>
          <td>${category}</td>
          <td class="amount">₦${value.revenue.toLocaleString()}</td>
          <td>₦${value.profit.toLocaleString()}</td>
        </tr>
      `,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${data.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      ${REPORT_CSS}
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div class="brand">
          <h1>Jossy-Diva Collections</h1>
          <p>Inventory & Sales Report</p>
        </div>
        <div class="report-meta">
          <strong>${data.title}</strong>
          <div>${data.dateRange}</div>
          <div>Generated: ${data.generatedAt}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="card">
          <span>Revenue</span>
          <h2>₦${report.revenue.toLocaleString()}</h2>
        </div>
        <div class="card">
          <span>Profit</span>
          <h2>₦${report.profit.toLocaleString()}</h2>
        </div>
        <div class="card">
          <span>Profit Margin</span>
          <h2>${report.profitMargin.toFixed(2)}%</h2>
        </div>
        <div class="card">
          <span>Transactions</span>
          <h2>${report.transactions}</h2>
        </div>
      </div>

      <div class="section">
        <h3>By Source</h3>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Revenue</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            ${bySourceRows || `<tr><td colspan="3">No data</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>By Category</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Revenue</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            ${byCategoryRows || `<tr><td colspan="3">No data</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Report generated automatically by Jossy-Diva system.
      </div>
    </div>
  </body>
</html>`;
}
