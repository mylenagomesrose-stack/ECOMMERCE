import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritosPage() {
  return (
    <div className="container-app py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-navy md:text-3xl">
        <Heart size={26} /> Meus favoritos
      </h1>
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <Heart size={56} className="text-border" />
        <p className="text-lg font-semibold">Você ainda não salvou favoritos</p>
        <p className="text-sm text-muted">Toque no coração dos produtos para guardá-los aqui.</p>
        <Link href="/produtos" className="btn btn-primary mt-2 px-6 py-3 text-sm">Explorar produtos</Link>
      </div>
    </div>
  );
}
