"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, User, Heart, ShoppingCart, Menu, X, ChevronDown, ChevronRight,
  Activity, Truck, ShieldCheck, Stethoscope,
} from "lucide-react";
import { categories } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const { count, setOpen } = useCart();
  const { user, profile } = useAuth();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/produtos?q=${encodeURIComponent(q.trim())}` : "/produtos");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-sm">
      {/* Top bar */}
      <div className="bg-navy text-white/90">
        <div className="container-app flex h-9 items-center justify-between text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Compra 100% segura · Loja especializada</span>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="flex items-center gap-1.5"><Truck size={13} /> Enviamos para todo o Brasil</span>
            <Link href="/atendimento" className="flex items-center gap-1.5 hover:text-white"><Stethoscope size={13} /> Fale com um especialista</Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-app flex items-center gap-3 py-3">
        <button className="lg:hidden" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}>
          <Menu size={26} />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="OrtoCenter — página inicial">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-sm">
            <Activity size={20} strokeWidth={2.5} />
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-navy sm:block">
            OrtoCenter
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={submit} className="flex flex-1 items-center">
          <div className="flex w-full items-center rounded-full border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Pesquisar tornozeleira, joelheira, bandagem, crioterapia..."
              aria-label="Pesquisar produtos"
              className="w-full bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted"
            />
            <button type="submit" className="mr-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark" aria-label="Buscar">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Actions */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/conta" className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background sm:flex" aria-label="Minha conta">
            <User size={22} />
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[10px] text-muted">{user ? (profile?.name?.split(" ")[0] || "Olá") : "Entrar"}</span>
              <span className="block text-xs font-semibold">{user ? "Minha conta" : "Criar conta"}</span>
            </span>
          </Link>
          <Link href="/favoritos" className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-background" aria-label="Favoritos">
            <Heart size={22} />
          </Link>
          <button onClick={() => setOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-background" aria-label={`Carrinho com ${count} itens`}>
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Categories bar (desktop) */}
      <div className="hidden border-t border-border bg-surface lg:block">
        <div className="container-app flex items-center gap-1">
          <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
            <button className="flex items-center gap-2 rounded-t-lg px-3 py-2.5 text-sm font-semibold text-navy hover:text-primary">
              <Menu size={18} /> Todas as categorias <ChevronDown size={15} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full z-50 w-72 rounded-b-xl border border-border bg-surface py-2 shadow-lg">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/categoria/${c.slug}`} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-primary-light hover:text-primary-dark">
                    {c.name} <ChevronRight size={15} className="text-muted" />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <span className="mx-1 h-5 w-px bg-border" />
          {categories.map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:text-primary">
              {c.name}
            </Link>
          ))}
          <Link href="/ofertas" className="ml-auto rounded-lg px-3 py-2.5 uppercase">
            <span className="neon-ofertas">Ofertas</span>
          </Link>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto bg-surface p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-extrabold text-navy">OrtoCenter</span>
              <button aria-label="Fechar menu" onClick={() => setMobileOpen(false)}><X size={24} /></button>
            </div>
            <Link href="/conta" onClick={() => setMobileOpen(false)} className="mb-4 flex items-center gap-2 rounded-lg bg-background p-3 text-sm font-semibold">
              <User size={20} /> Entrar / Criar conta
            </Link>
            <p className="mb-1 px-1 text-xs font-bold uppercase tracking-wide text-muted">Categorias</p>
            <nav className="flex flex-col">
              {categories.map((c) => (
                <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center justify-between border-b border-border py-3 text-sm">
                  {c.name} <ChevronRight size={16} className="text-muted" />
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <Link href="/ofertas" onClick={() => setMobileOpen(false)} className="py-1 uppercase"><span className="neon-ofertas">Ofertas</span></Link>
              <Link href="/pedidos" onClick={() => setMobileOpen(false)} className="py-1">Meus pedidos</Link>
              <Link href="/favoritos" onClick={() => setMobileOpen(false)} className="py-1">Favoritos</Link>
              <Link href="/atendimento" onClick={() => setMobileOpen(false)} className="py-1">Atendimento</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
