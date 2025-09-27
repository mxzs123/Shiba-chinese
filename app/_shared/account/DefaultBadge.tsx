"use client";

import { Check } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type DefaultBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string;
};

export function DefaultBadge({
  label = "默认",
  className,
  ...props
}: DefaultBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#04a36f] px-2 py-0.5 text-[11px] font-medium text-white",
        className,
      )}
      {...props}
    >
      <Check className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

export default DefaultBadge;
