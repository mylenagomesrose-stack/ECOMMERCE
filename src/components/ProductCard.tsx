"use client";

import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatBRL, installment } from "@/lib/format";
import { finalPrice, listPrice, discountPercent } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import ProductImage from "./ProductImage";
import Stars from "./Stars";

const BADGE_STYLE: Record<string, string> = {
  novidade: "bg-primary text-white",
  "mais-vendido": "bg-navy text-white",
  oferta: "bg-accent text-white",
};
const BADGE_LABEL: Record<string, string> = {
  novidade: "Novidade",
  "mais-vendido": "Mais vendido",
  oferta: "Oferta",
};

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const price = finalPrice(product);
  const parc = installment(price, product.installmentsMax);
  const discount = discountPercent(product);

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative">
        <Link href={`/produto/${product.slug}`} aria-label={product.name}>
          <ProductImage
            from={product.colorFrom}
            to={product.colorTo}
            icon={product.imageIcon}
            label={product.name}
            slug={product.slug}
            className="aspect-square w-full"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badges.map((b) => (
            <span key={b} className={`badge ${BADGE_STYLE[b]}`}>{BADGE_LABEL[b]}</span>
          ))}
          {discount > 0 && <span className="badge bg-accent-dark text-white">-{discount}%</span>}
        </div>
        <button
          type="button"
          aria-label="Adicionar aos favoritos"
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-navy shadow-sm transition hover:text-accent"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{product.brand}</p>
        <Link href={`/produto/${product.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary-dark">
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-muted">({product.reviewsCount})</span>
        </div>
        <p className="text-[11px] text-muted">Cód. {product.code} · Modelo {product.model}</p>

        <div className="mt-auto pt-1">
          <span className="text-xs text-muted line-through">{formatBRL(listPrice(product))}</span>
          <p className="text-lg font-bold text-navy">{formatBRL(price)}</p>
          <p className="text-[11px] text-muted">
            em até <strong className="text-foreground">{parc.n}x</strong> de {formatBRL(parc.value)} · à vista no Pix
          </p>
        </div>

        <div className="mt-2 flex gap-2">
          <Link href={`/produto/${product.slug}`} className="btn btn-outline flex-1 px-2 py-2 text-xs">
            Ver produto
          </Link>
          <button
            type="button"
            onClick={() => add(product, product.sizes?.[0])}
            disabled={product.availability === "indisponivel"}
            className="btn btn-primary px-3 py-2 text-xs disabled:opacity-50"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
