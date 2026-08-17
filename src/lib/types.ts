export type Availability = "em-estoque" | "sob-encomenda" | "indisponivel";

export type Badge = "novidade" | "mais-vendido" | "oferta";

export interface Category {
  slug: string;
  name: string;
  group: string;
  icon: string; // lucide icon name
  description: string;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  code: string; // SKU
  gtin?: string;
  categorySlug: string;
  type: string;
  sizes?: string[];
  price: number;
  oldPrice?: number;
  installmentsMax: number; // parcelas sem juros
  availability: Availability;
  stock: number;
  rating: number;
  reviewsCount: number;
  badges: Badge[];
  colorFrom: string; // gradiente do placeholder de imagem
  colorTo: string;
  imageIcon: string; // lucide icon representando o produto
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  compatibility: string[];
  needsCompatibilityCheck: boolean;
  reviews: Review[];
}

export interface CartLine {
  productId: string;
  size?: string;
  qty: number;
}
