import { HorizontalBarList } from "../../../components/horizontal-bar-list";
import { TrendChart } from "../../../components/trend-chart";
import { salesDashboardMock } from "../../../lib/mock/sales-dashboard";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function SalesHomePage() {
  const { revenue, products, customers, tasks } = salesDashboardMock;

  const monthlyTrend = revenue.monthlyTrend.map((item) => ({
    label: item.month.slice(5),
    value: item.value,
  }));

  const dailyTrend = revenue.dailyBreakdown.map((item) => ({
    label: item.date.slice(5),
    value: item.value,
  }));

  const dailyMax = Math.max(...dailyTrend.map((item) => item.value), 1);

  const latestMonthlyPoint = revenue.monthlyTrend.at(-1);
  const latestMonthlyValueLabel = latestMonthlyPoint
    ? currencyFormatter.format(latestMonthlyPoint.value)
    : "--";

  const productContribution = products.map((item) => ({
    label: item.name,
    value: item.amount,
    hint: `类别 ${item.category}`,
  }));

  const ageDistribution = customers.demographics.ageGroups.map((group) => ({
    label: group.range,
    value: group.ratio,
    emphasis: formatPercent(group.ratio),
  }));

  const femalePercent = formatPercent(customers.demographics.female);
  const malePercent = formatPercent(customers.demographics.male);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <header>
          <h2 className="text-base font-semibold text-neutral-900">
            时间维度销售量分析
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            按月展示近半年营收走势，并拆分最近一周的日度表现。
          </p>
        </header>
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <TrendChart
            className="lg:border-r lg:border-neutral-100 lg:pr-6"
            data={monthlyTrend}
            latestValueLabel={latestMonthlyValueLabel}
          />
          <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <h3 className="text-sm font-semibold text-neutral-800">
              日度销售拆分
            </h3>
            <ul className="mt-3 space-y-3 text-sm text-neutral-600">
              {dailyTrend.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="w-12 text-neutral-400">{item.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{
                        width: `${Math.round((item.value / dailyMax) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-20 text-right font-medium text-neutral-900">
                    {currencyFormatter.format(item.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">
          产品维度销售量分析
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          月度销量按 ABC 分类排列，帮助快速定位重点单品。
        </p>
        <div className="mt-5">
          <HorizontalBarList
            items={productContribution}
            valueFormatter={(value) => currencyFormatter.format(value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">
          客户维度数据
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              客户总数
            </p>
            <p className="mt-2 text-xl font-semibold text-neutral-900">
              {customers.total}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              新增客户
            </p>
            <p className="mt-2 text-xl font-semibold text-neutral-900">
              {customers.newThisMonth}
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-6 text-sm text-neutral-600">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              性别结构
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 rounded-full bg-neutral-100">
                <div
                  className="flex h-2 overflow-hidden rounded-full"
                  aria-hidden
                >
                  <span
                    className="h-full bg-primary"
                    style={{ width: femalePercent }}
                  />
                  <span
                    className="h-full bg-primary/30"
                    style={{ width: malePercent }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />{" "}
                  女 {femalePercent}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary/30" />{" "}
                  男 {malePercent}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              年龄结构
            </p>
            <div className="mt-3">
              <HorizontalBarList
                items={ageDistribution}
                valueFormatter={(value) => formatPercent(value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">
          每日任务清单
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          按优先顺序列出今日需跟进事项，确保及时完成。
        </p>
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => {
            const priorityLabel =
              task.priority === "high"
                ? "高优先级"
                : task.priority === "medium"
                  ? "中优先级"
                  : "低优先级";
            const priorityStyle =
              task.priority === "high"
                ? "bg-rose-100 text-rose-700"
                : task.priority === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-200 text-neutral-600";

            return (
              <li
                key={task.id}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>截止 {task.dueDate}</span>
                  <span
                    className={`rounded px-2 py-0.5 font-medium ${priorityStyle}`}
                  >
                    {priorityLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {task.title}
                </p>
                {task.summary ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    {task.summary}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
