"use client";

import Link from "next/link";
import { X, Trash2, ShoppingCart, Minus, Plus, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatBRL } from "@/lib/format";
import { finalPrice } from "@/lib/pricing";
import ProductImage from "./ProductImage";

export default function CartDrawer() {
  const { isOpen, setOpen, detailed, subtotal, setQty, remove, count } = useCart();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart size={20} /> Meu carrinho <span className="text-sm font-normal text-muted">({count})</span>
          </h2>
          <button aria-label="Fechar carrinho" onClick={() => setOpen(false)}><X size={24} /></button>
        </div>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingCart size={48} className="text-border" />
            <p className="font-semibold">Seu carrinho está vazio</p>
            <p className="text-sm text-muted">Explore nosso catálogo de próteses e componentes.</p>
            <Link href="/produtos" onClick={() => setOpen(false)} className="btn btn-primary mt-2 px-5 py-2.5 text-sm">Ver produtos</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-3">
                {detailed.map(({ line, product }) => (
                  <li key={`${product.id}-${line.size}`} className="flex gap-3 rounded-xl border border-border p-2">
                    <ProductImage from={product.colorFrom} to={product.colorTo} icon={product.imageIcon} label={product.name} slug={product.slug} className="h-20 w-20 shrink-0 rounded-lg" iconSize={34} />
                    <div className="flex flex-1 flex-col">
                      <Link href={`/produto/${product.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-semibold hover:text-primary">{product.name}</Link>
                      {line.size && <span className="text-xs text-muted">Tamanho: {line.size}</span>}
                      <span className="text-xs text-muted">Cód. {product.code}</span>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <div className="flex items-center rounded-full border border-border">
                          <button aria-label="Diminuir" onClick={() => setQty(product.id, line.size, line.qty - 1)} className="grid h-7 w-7 place-items-center"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                          <button aria-label="Aumentar" onClick={() => setQty(product.id, line.size, line.qty + 1)} className="grid h-7 w-7 place-items-center"><Plus size={14} /></button>
                        </div>
                        <span className="text-sm font-bold text-navy">{formatBRL(finalPrice(product) * line.qty)}</span>
                      </div>
                    </div>
                    <button aria-label="Remover item" onClick={() => remove(product.id, line.size)} className="self-start text-muted hover:text-accent"><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="text-xl font-bold text-navy">{formatBRL(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-accent w-full py-3 text-sm">Finalizar compra</Link>
              <Link href="/carrinho" onClick={() => setOpen(false)} className="btn btn-outline mt-2 w-full py-2.5 text-sm">Ver carrinho completo</Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={13} /> Ambiente seguro · Pix, cartão e boleto</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
