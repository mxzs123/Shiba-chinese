import { ShieldCheck, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";

const assurances = [
  {
    title: "药剂师在线答疑",
    description: "随时连线日本注册药剂师获取用药建议",
    icon: Stethoscope,
  },
  {
    title: "正品保障承诺",
    description: "出库附溯源码与批次证明，全链路可追踪",
    icon: ShieldCheck,
  },
];

type ReassuranceNoticeProps = {
  className?: string;
};

export function ReassuranceNotice({ className }: ReassuranceNoticeProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white/80 px-5 py-4",
        className,
      )}
    >
      <p className="text-sm font-semibold text-neutral-900">安心服务提示</p>
      <div className="grid w-full gap-3 text-xs text-neutral-600 sm:grid-cols-2">
        {assurances.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-3.5 py-2.5 shadow-sm"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-neutral-900">
                  {item.title}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
