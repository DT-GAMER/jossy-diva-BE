/* =========================================================
   Receipt HTML Template
   Used for HTML → PDF rendering via Puppeteer
========================================================= */

import { RECEIPT_CSS } from './reciept-css';

export interface ReceiptItem {
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

export function generateReceiptHTML(data: ReceiptData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${data.receiptNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Font Awesome -->
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    rel="stylesheet"
  />

  <!-- Google Font -->
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />

  <style>
    ${RECEIPT_CSS}
  </style>
</head>

<body>

  <!-- WATERMARK -->
  <div class="watermark">
    <img
      src="https://res.cloudinary.com/dofiyn7bw/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1771070387/Gemini_Generated_Image_rw6skmrw6skmrw6s_hq6dp3.png"
      width="420"
      alt="Jossy Diva watermark"
    />
  </div>

  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <img
        src="https://res.cloudinary.com/dofiyn7bw/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1771070387/Gemini_Generated_Image_rw6skmrw6skmrw6s_hq6dp3.png"
        width="42"
        alt="Jossy Diva logo"
      />
    </div>

    <div class="brand">
      <h1>Jossy-Diva Collections</h1>
      <p>Premium Fashion & Accessories</p>
      <p>NO 10, Dalemo Road, Alakuko, Lagos State</p>

      <div class="contact">
        <span><i class="fa-solid fa-phone"></i> 0904 926 4366</span>
        <span><i class="fa-brands fa-instagram"></i> @jossydiva_collection</span>
      </div>
    </div>
  </div>

  <!-- META -->
  <div class="meta">
    <strong>Receipt No:</strong><span>${data.receiptNumber}</span>
    <strong>Date:</strong><span>${data.date}</span>
    <strong>Payment Method:</strong><span>${data.paymentMethod}</span>
  </div>

  <!-- ITEMS -->
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="qty">Qty</th>
        <th class="unit">Unit</th>
        <th class="total">Total</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td class="qty">${item.quantity}</td>
          <td class="unit">₦${item.unitPrice.toLocaleString()}</td>
          <td class="total">₦${item.total.toLocaleString()}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <!-- TOTAL -->
  <div class="summary">
    <span>TOTAL</span>
    <strong>₦${data.totalAmount.toLocaleString()}</strong>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>
      Thank you for shopping with Jossy-Diva
      <i class="fa-solid fa-heart"></i>
    </div>

    <div class="icons">
      <span><i class="fa-solid fa-phone"></i> 0904 926 4366</span>
      <span><i class="fa-brands fa-instagram"></i> @jossydiva_collection</span>
      <span><i class="fa-solid fa-receipt"></i> No refunds after payment</span>
    </div>
  </div>

</body>
</html>
`;
}
