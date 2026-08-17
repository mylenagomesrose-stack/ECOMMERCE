import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories, categoryBySlug, products } from "@/lib/data";
import Catalog from "@/components/Catalog";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) return { title: "Categoria" };
  return { title: cat.name, description: cat.description };
}

export default async function CategoriaPage({ params }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();

  const list = products.filter((p) => p.categorySlug === slug);

  return (
    <>
      <nav aria-label="Trilha" className="border-b border-border bg-surface">
        <div className="container-app flex items-center gap-1.5 py-3 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Início</Link>
          <ChevronRight size={14} />
          <Link href="/produtos" className="hover:text-primary">Produtos</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-foreground">{cat.name}</span>
        </div>
      </nav>
      <div className="border-b border-border bg-surface">
        <div className="container-app py-4">
          <p className="text-sm text-muted">{cat.description}</p>
        </div>
      </div>
      <Catalog products={list} title={cat.name} />
    </>
  );
}
