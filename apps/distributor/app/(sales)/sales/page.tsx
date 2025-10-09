import { HorizontalBarList } from "../../../components/horizontal-bar-list";
import { MetricCard } from "../../../components/metric-card";
import { TrendChart } from "../../../components/trend-chart";
import { salesDashboardMock } from "../../../lib/mock/sales-dashboard";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("zh-CN");

export default function SalesHomePage() {
  const { revenue, products, customers, tasks } = salesDashboardMock;

  const monthlyTrend = revenue.trend.map((item) => ({
    label: item.month.slice(5),
    value: item.value,
  }));

  const dailyTrend = revenue.dailyBreakdown.map((item) => ({
    label: item.date.slice(5),
    value: item.value,
  }));

  const dailyMax = Math.max(...dailyTrend.map((item) => item.value), 1);

  const activeCustomerRatio = customers.total
    ? Math.round((customers.newThisMonth / customers.total) * 100)
    : 0;

  const latestMonthlyPoint = monthlyTrend.at(-1);
  const latestMonthlyValueLabel = latestMonthlyPoint
    ? currencyFormatter.format(latestMonthlyPoint.value)
    : "--";

  const productContribution = products.map((item) => ({
    label: item.name,
    value: item.amount,
    hint: `类别 ${item.category}`,
    emphasis: `${Math.round((item.amount / revenue.monthlyTotal) * 100)}% 占比`,
  }));

  const ageDistribution = customers.demographics.ageGroups.map((group) => ({
    label: group.range,
    value: group.ratio,
    emphasis: `${Math.round(group.ratio * 100)}%`,
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="本月营收"
          value={currencyFormatter.format(revenue.monthlyTotal)}
          delta={12.4}
          deltaLabel="较上月"
          footer={`近 6 个月平均：${currencyFormatter.format(
            Math.round(
              revenue.trend.reduce((acc, item) => acc + item.value, 0) /
                revenue.trend.length,
            ),
          )}`}
        />
        <MetricCard
          title="新增客户"
          value={`${customers.newThisMonth} 人`}
          delta={8.2}
          deltaLabel="较上月"
          footer="新增客户主要来源：代理推荐 42%、官网 33%"
        />
        <MetricCard
          title="客户总量"
          value={`${customers.total} 人`}
          delta={3.1}
          deltaLabel="同比增长"
          footer={`活跃客户占比 ${activeCustomerRatio}%`}
        />
        <MetricCard
          title="核心产品占比"
          value={`${Math.round(((products[0]?.amount ?? 0) / revenue.monthlyTotal) * 100)}%`}
          delta={-4.6}
          deltaLabel="环比"
          footer="类别 A 产品贡献 63% 营收"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[2.2fr_1.3fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-neutral-900">
                月度销售趋势
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                近六个月营收走势：本月较峰值回落 30%，需关注大型客户续签节奏。
              </p>
              <TrendChart
                className="mt-6"
                data={monthlyTrend}
                latestValueLabel={latestMonthlyValueLabel}
              />
            </div>
            <div className="w-full rounded-lg border border-neutral-100 bg-neutral-50 p-4 lg:w-64">
              <h3 className="text-sm font-semibold text-neutral-800">
                本周日度分布
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
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
                    <span className="w-16 text-right font-medium text-neutral-900">
                      {numberFormatter.format(item.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">客户洞察</h2>
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                性别结构
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 rounded-full bg-neutral-100">
                  <div
                    className="flex h-2 overflow-hidden rounded-full"
                    aria-hidden
                  >
                    <span
                      className="h-full bg-primary"
                      style={{
                        width: `${customers.demographics.female * 100}%`,
                      }}
                    />
                    <span
                      className="h-full bg-primary/30"
                      style={{ width: `${customers.demographics.male * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-primary"
                      aria-hidden
                    />{" "}
                    女 {Math.round(customers.demographics.female * 100)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-primary/30"
                      aria-hidden
                    />{" "}
                    男 {Math.round(customers.demographics.male * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                年龄分布
              </p>
              <HorizontalBarList
                items={ageDistribution.map((item) => ({
                  label: item.label,
                  value: item.value,
                  emphasis: item.emphasis,
                }))}
                valueFormatter={(value) => `${Math.round(value * 100)}%`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">
            产品维度销售分析
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            ABC 分类帮助快速识别重点投放产品，类别 A 代表贡献 80%
            以上营收的重点品。
          </p>
          <div className="mt-5">
            <HorizontalBarList
              items={productContribution}
              valueFormatter={(value) => currencyFormatter.format(value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">
            今日重点任务
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            根据优先级排序的行动清单，帮助销售团队按时完成跟进与协同事项。
          </p>
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {task.priority === "high"
                      ? "高优先级"
                      : task.priority === "medium"
                        ? "中优先级"
                        : "低优先级"}
                  </span>
                  <span>截止 {task.dueDate}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  {task.title}
                </p>
                {task.summary ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    {task.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
