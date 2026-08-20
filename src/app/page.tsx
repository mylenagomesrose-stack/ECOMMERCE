import Link from "next/link";
import {
  ArrowRight, Truck, ShieldCheck, Headphones, CreditCard, Quote, Stethoscope, ChevronRight,
} from "lucide-react";
import { products, featured, novelties, offers } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";

const trust = [
  { icon: Truck, title: "Envio para todo o Brasil", text: "Acompanhe cada etapa do pedido" },
  { icon: ShieldCheck, title: "Compra 100% segura", text: "Dados protegidos e LGPD" },
  { icon: CreditCard, title: "Pix, cartão e boleto", text: "Parcele em até 12x" },
  { icon: Headphones, title: "Atendimento especializado", text: "Fale com nossa equipe" },
];

const testimonials = [
  { name: "Ana P.", text: "Encontrei a tornozeleira que precisava e chegou super rápido. Qualidade excelente!", rating: 5 },
  { name: "Carlos M.", text: "Comprei a joelheira Playmaker II e superou as expectativas. Recomendo a loja.", rating: 5 },
  { name: "Juliana R.", text: "Atendimento atencioso e produtos originais. Já é minha loja de confiança.", rating: 4 },
];

function uniqueById(list: typeof products) {
  const seen = new Set<string>();
  return list.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}

export default function HomePage() {
  const destaque = uniqueById([...featured, ...products]).slice(0, 8);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 80% 20%, #0e8f9e 0, transparent 45%), radial-gradient(circle at 10% 90%, #1f6feb 0, transparent 40%)" }} />
        <div className="container-app relative grid items-center gap-6 py-8 md:grid-cols-2 md:py-12">
          <div className="animate-fade-up">
            <span className="badge mb-3 bg-primary/20 text-primary-light">Especialistas em ortopedia e reabilitação</span>
            <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">
              Artigos ortopédicos para <span className="text-primary">performance, recuperação</span> e qualidade de vida.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/80 md:text-base">
              Tornozeleiras, joelheiras, braces, crioterapia, bandagens e acessórios das melhores marcas — Aircast, DonJoy, Valutrode e Endurance.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/produtos" className="btn btn-primary px-5 py-2.5 text-sm">Ver produtos <ArrowRight size={18} /></Link>
              <Link href="/atendimento" className="btn btn-outline border-white/30 px-5 py-2.5 text-sm text-white hover:bg-white/10">
                <Stethoscope size={18} /> Falar com especialista
              </Link>
            </div>
          </div>
          <div className="animate-fade-up relative hidden md:block">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
              {uniqueById([featured[0], novelties[0], products[7], products[11]]).filter(Boolean).slice(0, 4).map((p, i) => (
                <Link key={p.id} href={`/produto/${p.slug}`} className={`card overflow-hidden ${i % 2 ? "mt-6" : ""}`}>
                  <ProductImage from={p.colorFrom} to={p.colorTo} icon={p.imageIcon} label={p.name} slug={p.slug} className="aspect-square w-full" iconSize={48} />
                  <div className="bg-surface p-2 text-navy">
                    <p className="line-clamp-1 text-xs font-semibold">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-border bg-surface">
        <div className="container-app grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
          {trust.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark"><t.icon size={20} /></span>
              <div>
                <p className="text-sm font-bold leading-tight">{t.title}</p>
                <p className="text-xs text-muted">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <ProductSection title="Mais vendidos" subtitle="Os favoritos dos nossos clientes" items={destaque} href="/produtos" />

      {/* OFFER BANNER */}
      <section className="container-app py-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent-dark p-8 text-white md:p-12">
          <div aria-hidden className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-10 right-24 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative max-w-lg">
            <span className="badge bg-white/20 text-white">Ofertas da semana</span>
            <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">Tornozeleiras, joelheiras e acessórios com preços especiais</h2>
            <p className="mt-2 text-white/90">Aproveite condições exclusivas em itens selecionados de crioterapia, bandagens e suportes.</p>
            <Link href="/ofertas" className="btn mt-5 bg-white px-6 py-3 text-sm text-accent-dark hover:bg-white/90">Ver ofertas <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* NOVIDADES */}
      <ProductSection title="Novidades" subtitle="Lançamentos e chegadas recentes" items={uniqueById([...novelties, ...offers, ...products]).slice(0, 8)} href="/produtos" />

      {/* MARCAS */}
      <section className="container-app py-8">
        <div className="card flex flex-col items-start gap-4 border-primary/30 bg-primary-light p-6 md:flex-row md:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white"><Stethoscope size={24} /></span>
          <div className="flex-1">
            <h3 className="font-bold text-navy">Marcas de confiança</h3>
            <p className="text-sm text-primary-dark/90">
              Trabalhamos com as melhores marcas do mercado ortopédico: <strong>Aircast</strong>, <strong>DonJoy</strong>, <strong>DJO</strong>, <strong>Valutrode</strong>, <strong>Coflex</strong> e <strong>Endurance</strong>.
              Consulte nossa equipe para orientação na escolha do produto ideal.
            </p>
          </div>
          <Link href="/atendimento" className="btn btn-primary px-5 py-2.5 text-sm">Tirar dúvidas</Link>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-surface py-12">
        <div className="container-app">
          <h2 className="mb-1 text-center text-2xl font-extrabold text-navy md:text-3xl">Veja o que nossos clientes dizem</h2>
          <p className="mb-8 text-center text-sm text-muted">Avaliações reais</p>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <Quote size={28} className="text-primary/40" />
                <p className="mt-2 text-sm leading-relaxed text-foreground">{t.text}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <Stars rating={t.rating} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductSection({ title, subtitle, items, href }: { title: string; subtitle: string; items: typeof products; href: string }) {
  return (
    <section className="container-app py-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-navy md:text-3xl">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">Ver mais <ChevronRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {items.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
