import Link from "next/link";
import {
  PillIcon,
  HeartPulseIcon,
  AppleIcon,
  FlaskConicalIcon,
  SparklesIcon,
  HomeIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "lib/utils";

import type { HomeCategoryLink } from "./categories";
import { POPULAR_CATEGORY_LINKS } from "./categories";

type MobileQuickCategoryShortcutsProps = {
  categories?: HomeCategoryLink[];
  className?: string;
};

const categoryIcons = {
  处方药品: PillIcon,
  "非处方药品（OTC）": HeartPulseIcon,
  健康保健食品: AppleIcon,
  院内制剂: FlaskConicalIcon,
  美妆护肤: SparklesIcon,
  生活用品: HomeIcon,
  其他: MoreHorizontalIcon,
};

const labelToSlug: Record<string, string> = {
  处方药品: "prescription",
  "非处方药品（OTC）": "otc",
  健康保健食品: "wellness",
  院内制剂: "hospital",
  美妆护肤: "beauty",
  生活用品: "lifestyle",
  其他: "misc",
};

export function MobileQuickCategoryShortcuts({
  categories = POPULAR_CATEGORY_LINKS,
  className,
}: MobileQuickCategoryShortcutsProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className={cn("", className)}>
      <nav aria-label="品类快速导航">
        <ul className="grid grid-cols-4 gap-6 bg-white px-4 py-6">
          {categories.map((category) => {
            const Icon =
              categoryIcons[category.label as keyof typeof categoryIcons];
            const slug = labelToSlug[category.label] || "";
            const target = slug ? `/categories?category=${slug}` : "/categories";
            return (
              <li key={category.label}>
                <Link
                  href={target}
                  className="flex flex-col items-center gap-2 transition-opacity active:opacity-60"
                >
                  {Icon && (
                    <Icon
                      className="h-10 w-10 text-[#049e6b]"
                      strokeWidth={1.5}
                    />
                  )}
                  <span className="text-center text-xs text-neutral-600">
                    {category.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}

export default MobileQuickCategoryShortcuts;
