import { cn } from "@/lib/utils";

const assurances = [
  {
    title: "药剂师在线答疑",
    description:
      "有疑问随时点击客服咨询按钮，连接日本注册药剂师，获取用药建议。",
  },
  {
    title: "正品保障承诺",
    description:
      "100% 确保日本原装正品，出库即附官方溯源码与批次证明。",
  },
];

type ReassuranceNoticeProps = {
  className?: string;
};

export function ReassuranceNotice({ className }: ReassuranceNoticeProps) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <header>
        <p className="text-sm font-semibold text-neutral-900">安心服务提示</p>
      </header>
      <div className="grid grid-cols-1 gap-3 text-sm text-neutral-600 sm:grid-cols-2">
        {assurances.map((item) => (
          <article
            key={item.title}
            className="space-y-1 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4"
          >
            <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
            <p className="text-xs leading-5 text-neutral-500">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
