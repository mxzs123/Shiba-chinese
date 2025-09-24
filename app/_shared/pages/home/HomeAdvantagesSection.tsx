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
    description:
      "无论您身在何处，都能轻松收到来自日本的药品与健康产品。",
    icon: Globe2,
  },
  {
    title: "日本正规药局",
    description:
      "持有日本官方许可，严格遵守药事法规与专业标准。",
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
  heading?: string;
  subheading?: string;
  items?: AdvantageItem[];
  className?: string;
};

export function HomeAdvantagesSection({
  heading = "芝園薬局  Shiba Park Pharmacy",
  subheading =
    "以日本药事标准为底，结合跨境配送与专业药师服务，为全球用户打造值得信赖的购药体验。",
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
      <div className="rounded-3xl border border-[#049e6b]/20 bg-white p-8 shadow-sm dark:border-[#049e6b]/25 dark:bg-neutral-950 md:p-12">
        <header className="flex flex-col gap-3 text-neutral-900 dark:text-neutral-50 md:max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#049e6b]">
            品质承诺
          </p>
          <h2 className="text-3xl font-bold leading-snug md:text-4xl">{heading}</h2>
          <p className="text-base text-neutral-600 dark:text-neutral-300">{subheading}</p>
        </header>

        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={`${item.title}-${index}`}
                className="overflow-hidden rounded-2xl border border-[#049e6b]/30 bg-white p-6 shadow-sm dark:border-[#049e6b]/40 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#049e6b] text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeAdvantagesSection;
