import { Star } from "lucide-react";

export default function Stars({ rating, size = 14, showValue = false }: { rating: number; size?: number; showValue?: boolean }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Avaliação ${rating.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = i === full && half;
        return (
          <Star
            key={i}
            size={size}
            className={filled || isHalf ? "text-star" : "text-border"}
            fill={filled ? "var(--star)" : isHalf ? "url(#half)" : "transparent"}
            strokeWidth={1.5}
            aria-hidden
          />
        );
      })}
      {showValue && <span className="ml-1 text-xs font-semibold text-muted">{rating.toFixed(1)}</span>}
    </span>
  );
}
