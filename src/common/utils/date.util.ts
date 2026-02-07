export const DateUtil = {
  now(): Date {
    return new Date();
  },

  toISO(date: Date = new Date()): string {
    return date.toISOString();
  },

  addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime();
  },

  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime();
  },

  startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },
};
