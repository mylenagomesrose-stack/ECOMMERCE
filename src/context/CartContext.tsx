"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Product } from "@/lib/types";
import { productById } from "@/lib/data";
import { finalPrice } from "@/lib/pricing";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, size?: string, qty?: number) => void;
  remove: (productId: string, size?: string) => void;
  setQty: (productId: string, size: string | undefined, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  detailed: { line: CartLine; product: Product }[];
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ortocenter:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  function add(product: Product, size?: string, qty = 1) {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === product.id && l.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { productId: product.id, size, qty }];
    });
    setOpen(true);
  }

  function remove(productId: string, size?: string) {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
  }

  function setQty(productId: string, size: string | undefined, qty: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.productId === productId && l.size === size ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    );
  }

  function clear() {
    setLines([]);
  }

  const detailed = useMemo(
    () =>
      lines
        .map((line) => {
          const product = productById(line.productId);
          return product ? { line, product } : null;
        })
        .filter((x): x is { line: CartLine; product: Product } => x !== null),
    [lines],
  );

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => detailed.reduce((s, { line, product }) => s + finalPrice(product) * line.qty, 0),
    [detailed],
  );

  const value: CartContextValue = {
    lines, count, subtotal, add, remove, setQty, clear, isOpen, setOpen, detailed,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
