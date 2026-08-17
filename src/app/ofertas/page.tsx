import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import { offers } from "@/lib/data";
import Catalog from "@/components/Catalog";

export const metadata: Metadata = {
  title: "Ofertas — até 60% OFF",
  description: "Produtos selecionados com desconto especial de 60% na OrtoCenter Artigos Ortopédicos.",
};

export default function OfertasPage() {
  return (
    <>
      <nav aria-label="Trilha" className="border-b border-border bg-surface">
        <div className="container-app flex items-center gap-1.5 py-3 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Início</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-foreground">Ofertas</span>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-r from-accent to-accent-dark text-white">
        <div aria-hidden className="absolute -right-6 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="container-app relative flex items-center gap-4 py-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Flame size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">Ofertas exclusivas</h1>
            <p className="text-white/90">Produtos selecionados com <strong>60% de desconto</strong>. Aproveite enquanto durar!</p>
          </div>
        </div>
      </section>

      {offers.length > 0 ? (
        <Catalog products={offers} title="Produtos em oferta" />
      ) : (
        <div className="container-app py-16 text-center">
          <p className="text-lg font-semibold">Nenhuma oferta ativa no momento.</p>
          <Link href="/produtos" className="btn btn-primary mt-4 px-6 py-3 text-sm">Ver todos os produtos</Link>
        </div>
      )}
    </>
  );
}
