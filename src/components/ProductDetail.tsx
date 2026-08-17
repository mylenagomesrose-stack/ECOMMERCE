"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart, Zap, Heart, Minus, Plus, ShieldAlert, Truck, ShieldCheck, CreditCard,
  QrCode, Barcode, Check, MessageCircle, ChevronDown,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { formatBRL, installment } from "@/lib/format";
import { finalPrice, listPrice, discountPercent } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import { whatsappLink } from "./WhatsAppButton";
import ProductImage from "./ProductImage";
import Stars from "./Stars";

const TABS = ["Descrição", "Especificações", "Compatibilidade", "Documentação", "Avaliações", "Dúvidas"] as const;
type Tab = (typeof TABS)[number];

const AVAIL: Record<string, { label: string; cls: string }> = {
  "em-estoque": { label: "Em estoque · pronto para envio", cls: "text-success" },
  "sob-encomenda": { label: "Sob encomenda", cls: "text-warning" },
  indisponivel: { label: "Indisponível", cls: "text-accent-dark" },
};

export default function ProductDetail({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("Descrição");
  const [activeImg, setActiveImg] = useState(0);

  const price = finalPrice(product);
  const discount = discountPercent(product);
  const parc = installment(price, product.installmentsMax);
  const av = AVAIL[product.availability];
  const disabled = product.availability === "indisponivel";
  // 4 "ângulos" de imagem (mesmo placeholder com leves variações de gradiente)
  const gallery = [0, 1, 2, 3];

  function handleAdd(openDrawer = true) {
    add(product, size, qty);
    if (!openDrawer) setOpen(false);
  }

  return (
    <div className="container-app py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* GALERIA */}
        <div>
          <div className="card overflow-hidden">
            <ProductImage
              from={product.colorFrom}
              to={product.colorTo}
              icon={product.imageIcon}
              label={product.name}
              slug={product.slug}
              className="aspect-square w-full"
              iconSize={160 - activeImg * 8}
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {gallery.map((i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`overflow-hidden rounded-lg border-2 ${activeImg === i ? "border-primary" : "border-border"}`}
                aria-label={`Imagem ${i + 1}`}
              >
                <ProductImage from={product.colorFrom} to={product.colorTo} icon={product.imageIcon} label="" slug={product.slug} className="aspect-square w-full" iconSize={30} />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-navy md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Stars rating={product.rating} showValue /></span>
            <span className="text-muted">{product.reviewsCount} avaliações</span>
            <span className="text-muted">·</span>
            <span className="text-muted">Cód. <strong className="text-foreground">{product.code}</strong></span>
            <span className="text-muted">·</span>
            <span className="text-muted">Modelo <strong className="text-foreground">{product.model}</strong></span>
          </div>

          {/* PREÇO */}
          <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted line-through">{formatBRL(listPrice(product))}</p>
              <span className="badge bg-accent text-white">-{discount}% OFF</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-navy">{formatBRL(price)}</span>
              <span className="mb-1 text-sm text-success">no Pix</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              ou <strong className="text-foreground">{parc.n}x de {formatBRL(parc.value)}</strong> sem juros no cartão
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1"><QrCode size={13} /> Pix</span>
              <span className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1"><CreditCard size={13} /> Cartão</span>
              <span className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1"><Barcode size={13} /> Boleto</span>
            </div>
          </div>

          <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${av.cls}`}>
            <Check size={16} /> {av.label}
          </p>

          {/* SELEÇÃO DE TAMANHO */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Tamanho / configuração</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${size === s ? "border-primary bg-primary-light text-primary-dark" : "border-border hover:border-primary"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTIDADE + AÇÕES */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button aria-label="Diminuir quantidade" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center"><Minus size={16} /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button aria-label="Aumentar quantidade" onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center"><Plus size={16} /></button>
            </div>
            <button aria-label="Adicionar aos favoritos" className="grid h-11 w-11 place-items-center rounded-full border border-border text-navy hover:border-accent hover:text-accent"><Heart size={18} /></button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href="/checkout" onClick={() => handleAdd(false)} className={`btn btn-accent py-3.5 text-sm ${disabled ? "pointer-events-none opacity-50" : ""}`}>
              <Zap size={18} /> Comprar agora
            </Link>
            <button onClick={() => handleAdd(true)} disabled={disabled} className="btn btn-primary py-3.5 text-sm disabled:opacity-50">
              <ShoppingCart size={18} /> Adicionar ao carrinho
            </button>
          </div>

          {/* ALERTA DE COMPATIBILIDADE */}
          {product.needsCompatibilityCheck && (
            <div className="mt-5 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
              <ShieldAlert size={22} className="shrink-0 text-warning" />
              <p className="text-sm text-foreground">
                <strong>Confirme a compatibilidade antes de comprar.</strong> Este produto depende de medidas, modelo ou
                configuração específica. Em caso de dúvida, consulte um profissional habilitado ou nossa equipe.
              </p>
            </div>
          )}

          {/* DÚVIDA VIA WHATSAPP */}
          <a
            href={whatsappLink(`Olá, gostaria de tirar uma dúvida sobre o produto ${product.name} (Cód. ${product.code}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#25D366] px-4 py-3 text-sm font-semibold text-[#128C4A] transition hover:bg-[#25D366]/10"
          >
            <MessageCircle size={18} /> Tenho dúvidas sobre este produto
          </a>

          {/* ENTREGA */}
          <div className="mt-5 grid gap-2 rounded-xl border border-border p-4 text-sm">
            <p className="flex items-center gap-2"><Truck size={16} className="text-primary" /> Enviamos para todo o Brasil · <span className="text-muted">prazo estimado no checkout</span></p>
            <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Compra segura · dados protegidos (LGPD)</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-12">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${tab === t ? "border-b-2 border-primary text-primary-dark" : "text-muted hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "Descrição" && (
            <div className="max-w-3xl">
              <p className="leading-relaxed text-foreground">{product.description}</p>
              <p className="mt-3 leading-relaxed text-muted">{product.shortDescription}</p>
            </div>
          )}

          {tab === "Especificações" && (
            <div className="max-w-3xl overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).length === 0 ? (
                    <tr><td className="p-4 text-muted">Especificações não cadastradas para este item de demonstração.</td></tr>
                  ) : (
                    Object.entries(product.specs).map(([k, v], i) => (
                      <tr key={k} className={i % 2 ? "bg-background" : "bg-surface"}>
                        <th className="w-1/2 px-4 py-3 text-left font-semibold text-navy">{k}</th>
                        <td className="px-4 py-3 text-foreground">{v}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "Compatibilidade" && (
            <div className="max-w-3xl">
              {product.compatibility.length > 0 ? (
                <ul className="space-y-2">
                  {product.compatibility.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm"><Check size={16} className="text-success" /> {c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Nenhuma informação de compatibilidade cadastrada para este item de demonstração.</p>
              )}
              <p className="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-foreground">
                A compatibilidade deve ser confirmada por um profissional habilitado, considerando medidas e configuração.
              </p>
            </div>
          )}

          {tab === "Documentação" && (
            <div className="max-w-3xl text-sm text-muted">
              <p>Manuais e documentação técnica ficam disponíveis aqui quando cadastrados pelo lojista.</p>
              <p className="mt-2">Nenhum arquivo técnico disponível para este item de demonstração.</p>
            </div>
          )}

          {tab === "Avaliações" && (
            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-4xl font-extrabold text-navy">{product.rating.toFixed(1)}</span>
                <div>
                  <Stars rating={product.rating} size={18} />
                  <p className="text-sm text-muted">{product.reviewsCount} avaliações</p>
                </div>
              </div>
              <ul className="space-y-4">
                {product.reviews.map((r, i) => (
                  <li key={i} className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.author}</span>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="mt-1 text-sm text-foreground">{r.comment}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(r.date).toLocaleDateString("pt-BR")}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "Dúvidas" && (
            <div className="max-w-3xl space-y-3">
              {[
                ["Como confirmar a compatibilidade?", "Consulte um profissional habilitado com as medidas e o modelo da sua prótese, ou fale com nossa equipe pelo WhatsApp."],
                ["Qual o prazo de entrega?", "O prazo estimado é calculado no checkout conforme o endereço. Ele é uma estimativa e pode variar conforme a transportadora."],
                ["Posso parcelar?", "Sim, em até 12x sem juros no cartão, além de Pix e boleto."],
              ].map(([q, a]) => (
                <details key={q} className="group rounded-xl border border-border p-4">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-navy">
                    {q} <ChevronDown size={18} className="transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm text-muted">{a}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
