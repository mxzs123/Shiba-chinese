"use client";

import { Star } from "lucide-react";
import { cn } from "lib/utils";

export type RatingProps = {
  value: number;
  max?: number;
  reviewCount?: number;
  className?: string;
};

export function Rating({
  value,
  max = 5,
  reviewCount,
  className,
}: RatingProps) {
  const safeValue = Math.max(0, Math.min(value, max));
  const fullStars = Math.floor(safeValue);
  const hasHalf = safeValue - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const isFull = index < fullStars;
          const isHalf = index === fullStars && hasHalf;

          return (
            <span key={index} className="relative h-4 w-4">
              <Star
                className={cn(
                  "h-4 w-4 text-neutral-300",
                  (isFull || isHalf) && "text-amber-500",
                )}
                strokeWidth={1.5}
                aria-hidden
              />
              {isHalf ? (
                <Star
                  className="absolute inset-0 h-4 w-4 overflow-hidden text-amber-500"
                  strokeWidth={1.5}
                  aria-hidden
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
      <span className="text-sm text-neutral-500">
        {safeValue.toFixed(1)}
        {typeof reviewCount === "number" ? ` · ${reviewCount} 条评价` : null}
      </span>
    </div>
  );
}
