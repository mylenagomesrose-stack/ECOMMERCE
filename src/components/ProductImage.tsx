"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EXTS = ["webp", "png", "jpg", "jpeg"] as const;

export default function ProductImage({
  from,
  to,
  icon,
  label,
  className = "",
  iconSize = 88,
  slug,
  fit = "cover",
}: {
  from: string;
  to: string;
  icon: string;
  label: string;
  className?: string;
  iconSize?: number;
  slug?: string;
  fit?: "cover" | "contain";
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setSrc(null); return; }
    let cancelled = false;
    const locals = EXTS.map((e) => `/products/${slug}.${e}`);
    let i = 0;
    function tryNext() {
      if (cancelled) return;
      if (i >= locals.length) { setSrc(null); return; }
      const url = locals[i++];
      const probe = new window.Image();
      probe.onload = () => !cancelled && setSrc(url);
      probe.onerror = tryNext;
      probe.src = url;
    }
    tryNext();
    return () => { cancelled = true; };
  }, [slug]);

  if (src) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          className={`h-full w-full ${fit === "contain" ? "object-contain p-2" : "object-cover"}`}
        />
      </div>
    );
  }

  const Icon = ((Icons as unknown as Record<string, LucideIcon>)[icon] ?? Icons.Package) as LucideIcon;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={label}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0, transparent 40%)" }}
      />
      <Icon size={iconSize} strokeWidth={1.25} color="rgba(255,255,255,0.92)" aria-hidden />
    </div>
  );
}
