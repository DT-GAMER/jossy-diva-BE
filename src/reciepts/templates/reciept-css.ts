/* =========================================================
   Receipt CSS (A4 / PDF Safe)
   Used with receipt.html.ts
========================================================= */

export const RECEIPT_CSS = `
/* ================= RESET ================= */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 40px;
  font-family: 'Inter', Arial, sans-serif;
  color: #1f2937;
  background: radial-gradient(circle at top right, #f7f1e8 0%, #ffffff 45%, #fbf8f2 100%);
}

/* ================= BRAND TOKENS ================= */
:root {
  --brand-ink: #1f2937;
  --brand-accent: #c08a2f;
  --brand-rose: #b86a5f;
  --brand-sand: #f6efe4;
  --gray: #6b7280;
  --light-gray: #f2eee6;
}

/* ================= WATERMARK ================= */
.watermark {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
}

.watermark::before {
  content: '';
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: #efe6d6;
  opacity: 0.35;
}

.watermark img {
  width: 360px;
  opacity: 0.12; /* dimmer watermark */
  filter: grayscale(0.4) brightness(1.05) contrast(1.02) drop-shadow(0 0 0 transparent);
  background: #ffffff;
  border-radius: 50%;
  padding: 10px;
  box-shadow: none;
}

/* ================= HEADER ================= */
.header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 16px;
  background: linear-gradient(135deg, #2b2a2a 0%, #3d3128 55%, #5b3b32 100%);
  color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--brand-accent);
  box-shadow: 0 6px 16px rgba(17, 24, 39, 0.18);
}

.logo img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

/* ================= BRAND TEXT ================= */
.brand h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.brand p {
  margin: 4px 0;
  font-size: 12px;
  opacity: 0.9;
}

.brand .contact {
  margin-top: 6px;
  font-size: 11px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.brand .contact i {
  color: var(--brand-accent);
  margin-right: 4px;
}

/* ================= META ================= */
.meta {
  position: relative;
  z-index: 2;
  margin-top: 32px;
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 10px;
  font-size: 13px;
  padding: 18px 20px;
  background: var(--brand-sand);
  border-radius: 10px;
  border: 1px solid #eadfcd;
}

.meta strong {
  font-weight: 600;
}

/* ================= TABLE ================= */
table {
  position: relative;
  z-index: 2;
  width: 100%;
  border-collapse: collapse;
  margin-top: 28px;
  font-size: 13px;
}

thead th {
  background: #efe7db;
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: var(--brand-ink);
  border-top: 2px solid var(--brand-accent);
  border-bottom: 2px solid var(--brand-accent);
}

tbody td {
  padding: 12px;
  border-bottom: 1px solid #e7dfd3;
}

.qty,
.unit,
.total {
  text-align: right;
  white-space: nowrap;
}

/* ================= TOTAL ================= */
.summary {
  position: relative;
  z-index: 2;
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  align-items: center;
}

.summary span {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-ink);
}

.summary strong {
  font-size: 20px;
  color: var(--brand-rose);
}

/* ================= FOOTER ================= */
.footer {
  position: absolute;
  bottom: 40px;
  left: 40px;
  right: 40px;
  text-align: center;
  font-size: 11px;
  color: var(--gray);
  z-index: 2;
}

.footer .icons {
  margin-top: 6px;
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
}

.footer i {
  color: var(--brand-accent);
  margin-right: 4px;
}

/* ================= PRINT ================= */
@page {
  size: A4;
  margin: 0;
}
`;
