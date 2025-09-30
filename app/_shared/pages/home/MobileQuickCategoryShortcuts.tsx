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
        <ul className="grid grid-cols-4 gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
          {categories.map((category) => {
            const Icon =
              categoryIcons[category.label as keyof typeof categoryIcons];
            return (
              <li key={category.label}>
                <Link
                  href={category.href}
                  className="flex flex-col items-center gap-2 transition-all duration-200 active:scale-95"
                >
                  {Icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#049e6b]/10 to-[#049e6b]/5">
                      <Icon
                        className="h-5 w-5 text-[#049e6b]"
                        strokeWidth={2}
                      />
                    </div>
                  )}
                  <span className="text-center text-xs font-medium leading-tight text-neutral-700">
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
