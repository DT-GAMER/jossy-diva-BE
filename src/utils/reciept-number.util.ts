export class ReceiptNumberUtil {
  static generate(date: Date, sequence: number): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    const seq = String(sequence).padStart(4, '0');

    return `JD-RCPT-${yyyy}${mm}${dd}-${seq}`;
  }
}

