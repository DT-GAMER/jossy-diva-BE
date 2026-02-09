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
  color: #0f172a;
  background: #ffffff;
}

/* ================= BRAND TOKENS ================= */
:root {
  --brand-blue: #0f172a;
  --brand-gold: #d4af37;
  --gray: #475569;
  --light-gray: #f1f5f9;
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

.watermark img {
  width: 420px;
  opacity: 0.12; /* tuned for visibility */
}

/* ================= HEADER ================= */
.header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 16px;
  background: var(--brand-blue);
  color: #ffffff;
  padding: 24px;
  border-radius: 8px;
}

.logo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--brand-gold);
}

.logo img {
  width: 42px;
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
  color: var(--brand-gold);
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
  background: var(--light-gray);
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: var(--brand-blue);
}

tbody td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
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
  color: var(--brand-blue);
}

.summary strong {
  font-size: 20px;
  color: var(--brand-gold);
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
  color: var(--brand-gold);
  margin-right: 4px;
}

/* ================= PRINT ================= */
@page {
  size: A4;
  margin: 0;
}
`;
