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
const TEXT_GRAY = '#475569';

export function generateReceiptPDF(
  data: ReceiptData,
  logoBuffer: Buffer,
  phoneIcon: Buffer,
  instagramIcon: Buffer,
): PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
  });

  /* =====================================================
     HEADER
  ===================================================== */

   doc.rect(0, 0, doc.page.width, 120).fill(BRAND_BLUE);

  // Logo
  doc.image(logoBuffer, 40, 22, { width: 70 });

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
    .text('NO 10, Dalemo Road, Alakuko, Lagos State', 120, 68);


  // Icons row (NO EMOJIS)
  const iconY = 86;

  doc.image(phoneIcon, 120, iconY, { width: 10 });
  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .text('0904 926 4366', 135, iconY - 2);

  doc.image(instagramIcon, 220, iconY, { width: 10 });
  doc
    .text('@jossydiva_collection', 235, iconY - 2);

  doc.moveDown(5);
  doc.fillColor('#000000');

  /* =====================================================
     WATERMARK (MORE VISIBLE)
  ===================================================== */

  const centerX = doc.page.width / 2;
  const centerY = doc.page.height / 2 + 40;

  doc.save();
  doc.opacity(0.18); // 👈 stronger but elegant
  doc.image(logoBuffer, centerX - 160, centerY - 160, {
    width: 320,
  });
  doc.restore();

  /* =====================================================
     RECEIPT META
  ===================================================== */

  const metaStartY = doc.y;
  const labelX = 40;
  const valueX = 160;

  doc.fontSize(11);

  doc.font('Helvetica-Bold').text('Receipt No:', labelX, metaStartY);
  doc.font('Helvetica').text(data.receiptNumber, valueX, metaStartY);

  doc.font('Helvetica-Bold').text('Date:', labelX, metaStartY + 18);
  doc.font('Helvetica').text(data.date, valueX, metaStartY + 18);

  doc.font('Helvetica-Bold').text('Payment Method:', labelX, metaStartY + 36);
  doc.font('Helvetica').text(data.paymentMethod, valueX, metaStartY + 36);

  doc.moveDown(3);

  /* =====================================================
     ITEMS TABLE (UNCHANGED, ALREADY GOOD)
  ===================================================== */

  const tableTop = doc.y + 10;

  const colItemX = 45;
  const colQtyX = 320;
  const colUnitX = 380;
  const colTotalX = 480;

  doc.rect(40, tableTop - 6, 520, 24).fill('#F1F5F9');

  doc
    .fillColor(BRAND_BLUE)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Item', colItemX, tableTop)
    .text('Qty', colQtyX, tableTop, { width: 40, align: 'right' })
    .text('Unit', colUnitX, tableTop, { width: 70, align: 'right' })
    .text('Total', colTotalX, tableTop, { width: 80, align: 'right' });

  doc.fillColor('#000000').font('Helvetica');

  let y = tableTop + 28;

  for (const item of data.items) {
    doc
      .fontSize(11)
      .text(item.name, colItemX, y, { width: 250 })
      .text(String(item.quantity), colQtyX, y, { width: 40, align: 'right' })
      .text(`₦${item.unitPrice.toLocaleString()}`, colUnitX, y, {
        width: 70,
        align: 'right',
      })
      .text(`₦${item.total.toLocaleString()}`, colTotalX, y, {
        width: 80,
        align: 'right',
      });

    y += 22;
  }

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalY = y + 18;

  doc
    .moveTo(colUnitX, totalY - 6)
    .lineTo(560, totalY - 6)
    .strokeColor('#CBD5E1')
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(BRAND_BLUE)
    .text('TOTAL', colUnitX, totalY, { width: 70, align: 'right' });

  doc
    .fontSize(15)
    .fillColor(BRAND_GOLD)
    .text(`₦${data.totalAmount.toLocaleString()}`, colTotalX, totalY, {
      width: 80,
      align: 'right',
    });

  /* =====================================================
     FOOTER
  ===================================================== */

  const footerY = doc.page.height - 140;

  doc
    .fontSize(11)
    .fillColor('#000000')
    .text('Thank you for shopping with Jossy-Diva', 0, footerY, {
      align: 'center',
    });

  doc
    .fontSize(9)
    .fillColor(TEXT_GRAY)
    .text(
      'For enquiries: 0904 926 4366 | Instagram: @jossydiva_collection',
      0,
      footerY + 20,
      { align: 'center' },
    );

  doc
    .fontSize(8)
    .text('Please note: No refunds after payment.', 0, footerY + 36, {
      align: 'center',
    });

  doc.end();
  return doc;
}
