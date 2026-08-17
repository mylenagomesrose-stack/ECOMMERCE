import type { Product } from "./types";

// Regra de desconto:
// - Produtos em OFERTA (badge "oferta"): 60% de desconto
// - Demais produtos: 40% de desconto
// O campo product.price é tratado como o preço CHEIO ("de"); o preço final
// ("por") é calculado a partir dele.
export const OFFER_DISCOUNT = 0.6;
export const DEFAULT_DISCOUNT = 0.4;

export function isOffer(p: Product): boolean {
  return p.badges.includes("oferta");
}

export function discountRate(p: Product): number {
  return isOffer(p) ? OFFER_DISCOUNT : DEFAULT_DISCOUNT;
}

export function discountPercent(p: Product): number {
  return Math.round(discountRate(p) * 100);
}

/** Preço cheio, antes do desconto. */
export function listPrice(p: Product): number {
  return p.price;
}

/** Preço final, já com o desconto aplicado. */
export function finalPrice(p: Product): number {
  return Math.round(p.price * (1 - discountRate(p)));
}
