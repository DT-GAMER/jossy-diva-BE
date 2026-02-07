export const PriceUtil = {
  calculateDiscountedPrice(
    basePrice: number,
    discountType?: 'percentage' | 'fixed',
    discountValue?: number,
  ): number {
    if (!discountType || !discountValue || discountValue <= 0) {
      return basePrice;
    }

    if (discountType === 'percentage') {
      return Math.max(
        basePrice - basePrice * (discountValue / 100),
        0,
      );
    }

    if (discountType === 'fixed') {
      return Math.max(basePrice - discountValue, 0);
    }

    return basePrice;
  },

  calculateProfit(
    costPrice: number,
    sellingPrice: number,
    quantity: number,
  ): number {
    return (sellingPrice - costPrice) * quantity;
  },
};
