export const REPORT_CSS = `
  :root {
    --ink: #1f2937;
    --muted: #6b7280;
    --brand: #111827;
    --accent: #0f766e;
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e5e7eb;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    background: var(--bg);
  }

  .page {
    padding: 28px 30px 40px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid var(--border);
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .brand h1 {
    font-size: 22px;
    margin: 0 0 4px;
    color: var(--brand);
  }

  .brand p {
    margin: 0;
    font-size: 12px;
    color: var(--muted);
  }

  .report-meta {
    text-align: right;
    font-size: 12px;
    color: var(--muted);
  }

  .report-meta strong {
    display: block;
    font-size: 14px;
    color: var(--ink);
    margin-bottom: 2px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
  }

  .card span {
    font-size: 12px;
    color: var(--muted);
  }

  .card h2 {
    margin: 6px 0 0;
    font-size: 18px;
    color: var(--ink);
  }

  .section {
    margin-top: 18px;
  }

  .section h3 {
    margin: 0 0 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
  }

  th, td {
    padding: 10px 12px;
    text-align: left;
    font-size: 12px;
  }

  th {
    background: #f1f5f9;
    color: var(--muted);
    font-weight: 600;
  }

  tr:not(:last-child) td {
    border-bottom: 1px solid var(--border);
  }

  .amount {
    font-weight: 600;
    color: var(--accent);
  }

  .footer {
    margin-top: 26px;
    text-align: center;
    font-size: 11px;
    color: var(--muted);
  }
`;
