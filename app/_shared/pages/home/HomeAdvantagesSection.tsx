import { Globe2, ShieldCheck, PackageCheck, Stethoscope } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

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
          <p className="text-base text-neutral-600 md:text-lg">
            {subheading}
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:mt-12 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={`${item.title}-${index}`}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-[#049e6b]/15 bg-white/90 p-6 shadow-[0_16px_40px_-24px_rgba(4,158,107,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[#049e6b]/40 hover:shadow-[0_20px_45px_-20px_rgba(4,158,107,0.55)]"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#049e6b]/15 text-[#049e6b] ring-8 ring-[#049e6b]/8">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900 transition-colors duration-150 group-hover:text-[#049e6b]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-neutral-600">
                    {item.description}
                  </p>
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
