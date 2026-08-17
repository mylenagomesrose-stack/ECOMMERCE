"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, Star, PackageSearch } from "lucide-react";
import type { Product } from "@/lib/types";
import { categories } from "@/lib/data";
import { normalizeSearch } from "@/lib/format";
import { finalPrice } from "@/lib/pricing";
import ProductCard from "./ProductCard";

type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "avaliacao" | "novidades";

const AVAIL_LABEL: Record<string, string> = {
  "em-estoque": "Em estoque",
  "sob-encomenda": "Sob encomenda",
  indisponivel: "Indisponível",
};

export default function Catalog({
  products,
  query = "",
  title,
}: {
  products: Product[];
  query?: string;
  title?: string;
}) {
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [types, setTypes] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [brandsSel, setBrandsSel] = useState<string[]>([]);
  const [avail, setAvail] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxPriceSel, setMaxPriceSel] = useState<number>(0);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [visible, setVisible] = useState(20);

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => finalPrice(p)), 1000) / 1000) * 1000,
    [products],
  );
  const effectiveMax = maxPriceSel || priceCeiling;

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );
  const availableCats = useMemo(
    () => categories.filter((c) => products.some((p) => p.categorySlug === c.slug)),
    [products],
  );

  const q = normalizeSearch(query);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (q) {
        const hay = normalizeSearch(`${p.name} ${p.brand} ${p.model} ${p.code} ${p.shortDescription} ${p.categorySlug}`);
        if (!hay.includes(q)) return false;
      }
      if (types.length && !types.includes(p.type)) return false;
      if (cats.length && !cats.includes(p.categorySlug)) return false;
      if (brandsSel.length && !brandsSel.includes(p.brand)) return false;
      if (avail.length && !avail.includes(p.availability)) return false;
      if (minRating && p.rating < minRating) return false;
      if (finalPrice(p) > effectiveMax) return false;
      return true;
    });

    switch (sort) {
      case "menor-preco": list = [...list].sort((a, b) => finalPrice(a) - finalPrice(b)); break;
      case "maior-preco": list = [...list].sort((a, b) => finalPrice(b) - finalPrice(a)); break;
      case "avaliacao": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "novidades":
        list = [...list].sort((a, b) => Number(b.badges.includes("novidade")) - Number(a.badges.includes("novidade")));
        break;
    }
    return list;
  }, [products, q, types, cats, brandsSel, avail, minRating, effectiveMax, sort]);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function clearAll() {
    setTypes([]); setCats([]); setBrandsSel([]); setAvail([]); setMinRating(0); setMaxPriceSel(0);
  }

  const activeCount = types.length + cats.length + brandsSel.length + avail.length + (minRating ? 1 : 0) + (maxPriceSel ? 1 : 0);

  const FilterPanel = (
    <div className="flex flex-col gap-6">
      <FilterGroup title="Tipo de prótese">
        {[["membro-inferior", "Membro inferior"], ["membro-superior", "Membro superior"], ["outros", "Outros / componentes"]].map(([v, l]) => (
          <Check key={v} label={l} checked={types.includes(v)} onChange={() => toggle(types, setTypes, v)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Categoria">
        {availableCats.map((c) => (
          <Check key={c.slug} label={c.name} checked={cats.includes(c.slug)} onChange={() => toggle(cats, setCats, c.slug)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Marca">
        {availableBrands.map((b) => (
          <Check key={b} label={b} checked={brandsSel.includes(b)} onChange={() => toggle(brandsSel, setBrandsSel, b)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Faixa de preço">
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={500}
          value={effectiveMax}
          onChange={(e) => setMaxPriceSel(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
          aria-label="Preço máximo"
        />
        <p className="text-xs text-muted">Até <strong className="text-foreground">R$ {effectiveMax.toLocaleString("pt-BR")}</strong></p>
      </FilterGroup>

      <FilterGroup title="Disponibilidade">
        {["em-estoque", "sob-encomenda"].map((v) => (
          <Check key={v} label={AVAIL_LABEL[v]} checked={avail.includes(v)} onChange={() => toggle(avail, setAvail, v)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Avaliação">
        {[5, 4, 3].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="accent-[var(--primary)]" />
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < r ? "text-star" : "text-border"} fill={i < r ? "var(--star)" : "transparent"} />
              ))}
              <span className="ml-1 text-muted">{r === 5 ? "5 estrelas" : `${r}+ estrelas`}</span>
            </span>
          </label>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-app py-6">
      {title && <h1 className="mb-1 text-2xl font-extrabold text-navy md:text-3xl">{title}</h1>}
      <p className="mb-5 text-sm text-muted">
        {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        {query && <> para “<strong className="text-foreground">{query}</strong>”</>}
      </p>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="card sticky top-40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal size={18} /> Filtros</h2>
              {activeCount > 0 && <button onClick={clearAll} className="text-xs text-primary hover:underline">Limpar</button>}
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button onClick={() => setMobileFilters(true)} className="btn btn-outline px-4 py-2 text-sm lg:hidden">
              <SlidersHorizontal size={16} /> Filtrar {activeCount > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-white">{activeCount}</span>}
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="hidden text-muted sm:inline">Ordenar:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="novidades">Novidades</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <PackageSearch size={48} className="text-border" />
              <p className="font-semibold">Nenhum produto encontrado</p>
              <p className="text-sm text-muted">Tente ajustar os filtros ou refazer a busca.</p>
              {activeCount > 0 && <button onClick={clearAll} className="btn btn-primary mt-1 px-4 py-2 text-sm">Limpar filtros</button>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filtered.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {visible < filtered.length && (
                <div className="mt-8 text-center">
                  <button onClick={() => setVisible((v) => v + 20)} className="btn btn-outline px-6 py-3 text-sm">
                    Carregar mais produtos ({filtered.length - visible} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter modal */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold"><SlidersHorizontal size={18} /> Filtrar produtos</h2>
              <button aria-label="Fechar filtros" onClick={() => setMobileFilters(false)}><X size={24} /></button>
            </div>
            {FilterPanel}
            <div className="sticky bottom-0 mt-6 flex gap-2 bg-surface pt-2">
              <button onClick={clearAll} className="btn btn-outline flex-1 py-3 text-sm">Limpar</button>
              <button onClick={() => setMobileFilters(false)} className="btn btn-primary flex-1 py-3 text-sm">Ver {filtered.length} produtos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-navy">{title}</h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-[var(--primary)]" />
      {label}
    </label>
  );
}
