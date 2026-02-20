export const PriceUtil = {
  calculateDiscountedPrice(
    basePrice: number,
    discountType?: 'percentage' | 'fixed',
    discountValue?: number,
    discountStartAt?: Date | null,
    discountEndAt?: Date | null,
    now: Date = new Date(),
  ): number {
    if (!discountType || !discountValue || discountValue <= 0) {
      return basePrice;
    }

    if (discountStartAt && now < discountStartAt) {
      return basePrice;
    }

    if (discountEndAt && now > discountEndAt) {
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

  getDiscountCountdown(
    discountStartAt?: Date | null,
    discountEndAt?: Date | null,
    now: Date = new Date(),
  ): {
    active: boolean;
    endsAt: Date | null;
    remainingSeconds: number | null;
  } {
    if (discountStartAt && now < discountStartAt) {
      if (!discountEndAt) {
        return { active: false, endsAt: null, remainingSeconds: null };
      }
      const remaining = Math.max(
        Math.floor((discountEndAt.getTime() - now.getTime()) / 1000),
        0,
      );
      return {
        active: false,
        endsAt: discountEndAt,
        remainingSeconds: remaining,
      };
    }

    if (!discountEndAt) {
      return { active: true, endsAt: null, remainingSeconds: null };
    }

    const remaining = Math.max(
      Math.floor((discountEndAt.getTime() - now.getTime()) / 1000),
      0,
    );

    return {
      active: remaining > 0,
      endsAt: discountEndAt,
      remainingSeconds: remaining,
    };
  },
};
