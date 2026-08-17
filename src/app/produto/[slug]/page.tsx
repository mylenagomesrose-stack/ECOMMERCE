import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { productBySlug, products, categoryBySlug } from "@/lib/data";
import { finalPrice } from "@/lib/pricing";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  return {
    title: p.name,
    description: p.shortDescription,
    openGraph: { title: p.name, description: p.shortDescription },
  };
}

export default async function ProdutoPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const cat = categoryBySlug(product.categorySlug);
  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.code,
    brand: { "@type": "Brand", name: product.brand },
    description: product.shortDescription,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: finalPrice(product),
      availability: product.availability === "indisponivel"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Trilha" className="border-b border-border bg-surface">
        <div className="container-app flex flex-wrap items-center gap-1.5 py-3 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Início</Link>
          <ChevronRight size={14} />
          <Link href="/produtos" className="hover:text-primary">Produtos</Link>
          {cat && (
            <>
              <ChevronRight size={14} />
              <Link href={`/categoria/${cat.slug}`} className="hover:text-primary">{cat.name}</Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="line-clamp-1 font-semibold text-foreground">{product.name}</span>
        </div>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="container-app py-10">
          <h2 className="mb-5 text-xl font-extrabold text-navy md:text-2xl">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
