"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { products } from "@/lib/data";
import Catalog from "@/components/Catalog";
import { Suspense } from "react";

function ProdutosInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <>
      <nav aria-label="Trilha" className="border-b border-border bg-surface">
        <div className="container-app flex items-center gap-1.5 py-3 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Início</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-foreground">{q ? `Busca: ${q}` : "Todos os produtos"}</span>
        </div>
      </nav>
      <Catalog products={products} query={q} title={q ? `Resultados para "${q}"` : "Todos os produtos"} />
    </>
  );
}

export default function ProdutosClient() {
  return (
    <Suspense fallback={<div className="container-app py-12 text-center text-muted">Carregando...</div>}>
      <ProdutosInner />
    </Suspense>
  );
}
