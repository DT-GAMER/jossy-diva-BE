// src/receipts/templates/receipt.template.ts

import PDFDocument from 'pdfkit';

interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  paymentMethod: string;
  items: ReceiptItem[];
  totalAmount: number;
}

const BRAND_BLUE = '#0F172A';
const BRAND_GOLD = '#D4AF37';

export function generateReceiptPDF(
  data: ReceiptData,
  logoBuffer: Buffer,
): PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
  });

  /* ================= HEADER ================= */

  doc.rect(0, 0, doc.page.width, 120).fill(BRAND_BLUE);

  // LOGO (BUFFER)
  doc.image(logoBuffer, 40, 20, { width: 70 });

  doc
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Jossy-Diva Collections', 120, 28);

  doc
    .font('Helvetica')
    .fontSize(10)
    .text('Premium Fashion & Accessories', 120, 52);

  doc
    .fontSize(9)
    .text(
      'NO 10, Dalemo Road, Alakuko, Lagos State',
      120,
      68,
    );

  doc
    .fontSize(9)
    .text(
      '📞 0904 926 4366   |   📸 @jossydiva_collection',
      120,
      85,
    );

  doc.moveDown(5);
  doc.fillColor('#000000');

  /* ================= WATERMARK ================= */

  const centerX = doc.page.width / 2;
  const centerY = doc.page.height / 2 + 40;

  doc.save();
  doc.opacity(0.06);

  doc.image(logoBuffer, centerX - 150, centerY - 150, {
    width: 300,
  });

  doc.restore();

  /* ================= RECEIPT META ================= */

  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Receipt No:', 40)
    .font('Helvetica')
    .text(data.receiptNumber, 130);

  doc
    .font('Helvetica-Bold')
    .text('Date:', 40)
    .font('Helvetica')
    .text(data.date, 130);

  doc
    .font('Helvetica-Bold')
    .text('Payment Method:', 40)
    .font('Helvetica')
    .text(data.paymentMethod, 160);

  doc.moveDown(1.5);

  /* ================= ITEMS TABLE ================= */

  const tableTop = doc.y + 10;

  doc.rect(40, tableTop - 5, 520, 22).fill('#F1F5F9');

  doc
    .fillColor(BRAND_BLUE)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Item', 45, tableTop)
    .text('Qty', 300, tableTop)
    .text('Unit', 350, tableTop)
    .text('Total', 470, tableTop);

  doc.fillColor('#000000').font('Helvetica');

  let y = tableTop + 25;

  for (const item of data.items) {
    doc
      .fontSize(11)
      .text(item.name, 45, y, { width: 240 })
      .text(String(item.quantity), 300, y)
      .text(`₦${item.unitPrice.toLocaleString()}`, 350, y)
      .text(`₦${item.total.toLocaleString()}`, 470, y);

    y += 22;
  }

  /* ================= TOTAL ================= */

  doc
    .moveTo(350, y + 10)
    .lineTo(560, y + 10)
    .strokeColor('#CBD5E1')
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(BRAND_GOLD)
    .text(
      `TOTAL: ₦${data.totalAmount.toLocaleString()}`,
      350,
      y + 20,
      { align: 'right' },
    );

  doc.fillColor('#000000').font('Helvetica');

  /* ================= FOOTER ================= */

  doc
    .moveDown(4)
    .fontSize(11)
    .text(
      'Thank you for shopping with Jossy-Diva 💙',
      { align: 'center' },
    );

  doc
    .moveDown(0.5)
    .fontSize(9)
    .fillColor('#475569')
    .text(
      'For enquiries: 0904 926 4366 | Instagram: @jossydiva_collection',
      { align: 'center' },
    );

  doc
    .moveDown(0.3)
    .fontSize(8)
    .text(
      'Please note: No refunds after payment.',
      { align: 'center' },
    );

  doc.end();
  return doc;
}
