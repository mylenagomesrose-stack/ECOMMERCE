"use client";

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatBRL } from "@/lib/format";
import { finalPrice, listPrice } from "@/lib/pricing";
import ProductImage from "@/components/ProductImage";

export default function CarrinhoPage() {
  const { detailed, subtotal, setQty, remove, count } = useCart();
  const frete = subtotal > 0 && subtotal < 500 ? 49.9 : 0;
  const total = subtotal + frete;

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-navy md:text-3xl">
        <ShoppingCart size={26} /> Meu carrinho <span className="text-base font-normal text-muted">({count} itens)</span>
      </h1>

      {detailed.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <ShoppingCart size={56} className="text-border" />
          <p className="text-lg font-semibold">Seu carrinho está vazio</p>
          <p className="text-sm text-muted">Explore nosso catálogo de próteses, componentes e acessórios.</p>
          <Link href="/produtos" className="btn btn-primary mt-2 px-6 py-3 text-sm">Ver produtos</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Itens */}
          <div className="flex flex-col gap-3">
            {detailed.map(({ line, product }) => (
              <div key={`${product.id}-${line.size}`} className="card flex gap-4 p-3">
                <ProductImage from={product.colorFrom} to={product.colorTo} icon={product.imageIcon} label={product.name} slug={product.slug} className="h-28 w-28 shrink-0 rounded-lg" iconSize={44} />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-primary">{product.brand}</p>
                      <Link href={`/produto/${product.slug}`} className="font-semibold hover:text-primary">{product.name}</Link>
                      {line.size && <p className="text-xs text-muted">Tamanho: {line.size}</p>}
                      <p className="text-xs text-muted">Cód. {product.code}</p>
                    </div>
                    <button aria-label="Remover" onClick={() => remove(product.id, line.size)} className="text-muted hover:text-accent"><Trash2 size={18} /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-full border border-border">
                      <button aria-label="Diminuir" onClick={() => setQty(product.id, line.size, line.qty - 1)} className="grid h-9 w-9 place-items-center"><Minus size={15} /></button>
                      <span className="w-8 text-center text-sm font-semibold">{line.qty}</span>
                      <button aria-label="Aumentar" onClick={() => setQty(product.id, line.size, line.qty + 1)} className="grid h-9 w-9 place-items-center"><Plus size={15} /></button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-navy">{formatBRL(finalPrice(product) * line.qty)}</p>
                      <p className="text-xs text-muted"><span className="line-through">{formatBRL(listPrice(product))}</span> {formatBRL(finalPrice(product))} un.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/produtos" className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark">
              <ArrowLeft size={16} /> Continuar comprando
            </Link>
          </div>

          {/* Resumo */}
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <div className="card p-5">
              <h2 className="mb-4 text-lg font-bold">Resumo do pedido</h2>
              <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                <Tag size={16} className="text-muted" />
                <input placeholder="Cupom de desconto" className="w-full bg-transparent text-sm outline-none" />
                <button className="btn btn-outline px-3 py-1.5 text-xs">Aplicar</button>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{formatBRL(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Frete</dt><dd className="font-semibold">{frete === 0 ? <span className="text-success">Grátis</span> : formatBRL(frete)}</dd></div>
                {frete > 0 && <p className="text-xs text-muted">Frete grátis em compras acima de {formatBRL(500)}.</p>}
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-extrabold text-navy">{formatBRL(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">ou 12x de {formatBRL(total / 12)} sem juros</p>
              <Link href="/checkout" className="btn btn-accent mt-4 w-full py-3.5 text-sm">Finalizar compra</Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={13} /> Ambiente seguro · Pix, cartão e boleto</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
