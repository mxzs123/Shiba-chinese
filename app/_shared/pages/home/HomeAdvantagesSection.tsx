"use client";

import { Globe2, ShieldCheck, PackageCheck, Stethoscope } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "lib/utils";

type AdvantageItem = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const DEFAULT_ITEMS: AdvantageItem[] = [
  {
    title: "全球直送",
    description: "无论您身在何处，都能轻松收到来自日本的药品与健康产品。",
    icon: Globe2,
  },
  {
    title: "日本正规药局",
    description: "持有日本官方许可，严格遵守药事法规与专业标准。",
    icon: ShieldCheck,
  },
  {
    title: "原装正品保障",
    description: "所有产品均由正规渠道采购，100%确保日本原装正品。",
    icon: PackageCheck,
  },
  {
    title: "药剂师专业指导",
    description: "日本注册药剂师为您提供专业的用药咨询与指导服务。",
    icon: Stethoscope,
  },
];

type HomeAdvantagesSectionProps = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  items?: AdvantageItem[];
  className?: string;
};

export function HomeAdvantagesSection({
  eyebrow = "芝園薬局 Shiba Park Pharmacy",
  heading = "品质承诺",
  subheading = "以日本药事标准为底，结合跨境配送与专业药师服务，为全球用户打造值得信赖的购药体验。",
  items = DEFAULT_ITEMS,
  className,
}: HomeAdvantagesSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-(--breakpoint-2xl) px-4",
        "sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="rounded-3xl border border-[#049e6b]/20 bg-white/95 p-8 shadow-sm backdrop-blur-sm md:p-12">
        <header className="flex flex-col gap-5 text-neutral-900 md:max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#049e6b]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#049e6b]/10 px-3 py-1 tracking-[0.25em] text-xs md:text-sm">
              <span
                className="size-1.5 rounded-full bg-[#049e6b]"
                aria-hidden="true"
              />
              {eyebrow}
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="text-base text-neutral-600 md:text-lg">{subheading}</p>
        </header>

        <div className="mt-10 grid grid-cols-2 items-start gap-4 xl:mt-12 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedIndex === index;
            return (
              <article
                key={`${item.title}-${index}`}
                className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-[#049e6b]/15 bg-white/90 p-4 shadow-[0_16px_40px_-24px_rgba(4,158,107,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[#049e6b]/40 hover:shadow-[0_20px_45px_-20px_rgba(4,158,107,0.55)] md:items-start md:gap-4 md:rounded-2xl md:p-6 cursor-pointer active:scale-95 md:cursor-default md:active:scale-100"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (window.innerWidth < 768) {
                    toggleExpand(index);
                  }
                }}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#049e6b]/15 text-[#049e6b] ring-4 ring-[#049e6b]/8 md:size-12 md:rounded-2xl md:ring-8">
                  <Icon className="size-5 md:size-6" aria-hidden="true" />
                </span>
                <div className="w-full space-y-1 text-center md:space-y-2 md:text-left">
                  <h3 className="text-sm font-semibold text-neutral-900 transition-colors duration-150 group-hover:text-[#049e6b] md:text-lg">
                    {item.title}
                  </h3>
                  {/* 桌面端：始终显示 */}
                  <p className="hidden text-xs leading-relaxed text-neutral-600 md:block md:text-sm md:leading-6">
                    {item.description}
                  </p>
                  {/* 移动端：点击展开 */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden md:hidden"
                      >
                        <p className="text-xs leading-relaxed text-neutral-600">
                          {item.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeAdvantagesSection;
