const COMBINING = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return BRL.format(value);
}

/** Retorna a maior parcela "cheia" sem juros, ex.: 12x de R$ 158,25 */
export function installment(value: number, max: number): { n: number; value: number } {
  const n = Math.min(max, 12);
  return { n, value: value / n };
}

/** Busca tolerante a acentos/caixa */
export function normalizeSearch(input: string): string {
  return input.toLowerCase().normalize("NFD").replace(COMBINING, "").trim();
}
