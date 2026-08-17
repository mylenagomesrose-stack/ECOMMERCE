import type { Metadata } from "next";
import ProdutosClient from "./ProdutosClient";

export const metadata: Metadata = {
  title: "Todos os produtos",
  description: "Catálogo completo de próteses, componentes e acessórios ortopédicos.",
};

export default function ProdutosPage() {
  return <ProdutosClient />;
}
