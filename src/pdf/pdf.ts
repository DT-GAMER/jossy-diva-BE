import puppeteer, { Browser } from 'puppeteer';

export class PdfGenerator {
  private static browser: Browser | null = null;

  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none',
        ],
      });
    }
    return this.browser;
  }

  static async generatePdf({ html }: { html: string }): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '25mm',
        left: '15mm',
        right: '15mm',
      },
    });

    await page.close();
    return Buffer.from(pdf);
  }
}
