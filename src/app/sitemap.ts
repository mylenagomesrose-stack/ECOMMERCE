import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/data";

export const dynamic = "force-static";

const BASE = "https://ortocenter.demo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/produtos", "/ofertas", "/atendimento", "/sobre", "/pagamento", "/entrega"].map((r) => ({
    url: `${BASE}${r}`,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.7,
  }));
  const catRoutes = categories.map((c) => ({ url: `${BASE}/categoria/${c.slug}`, priority: 0.8 }));
  const prodRoutes = products.map((p) => ({ url: `${BASE}/produto/${p.slug}`, priority: 0.6 }));
  return [...staticRoutes, ...catRoutes, ...prodRoutes];
}
