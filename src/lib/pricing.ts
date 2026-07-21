export const PRICE = 39.9;

export const COUPONS: Record<string, number> = {
  NAMU10: 0.1,
};

/** Calcula o valor final (em reais) aplicando o cupom, se válido. Usado tanto
 * na UI quanto no backend — o backend nunca confia num valor vindo do cliente. */
export function priceWithCoupon(couponCode?: string | null): number {
  const code = couponCode?.trim().toUpperCase();
  const discountRate = code && COUPONS[code] ? COUPONS[code] : 0;
  return PRICE * (1 - discountRate);
}
