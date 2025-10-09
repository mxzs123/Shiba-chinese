import { HorizontalBarList } from "../../../components/horizontal-bar-list";
import { MetricCard } from "../../../components/metric-card";
import { TrendChart } from "../../../components/trend-chart";
import { distributorDashboardMock } from "../../../lib/mock/distributor-dashboard";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

export default function DistributorHomePage() {
  const { commission, productSales, secondaryDistributorSummary } =
    distributorDashboardMock;

  const monthlyCommissionTrend = commission.trend.map((item) => ({
    label: item.month.slice(5),
    value: item.amount,
  }));

  const latestCommissionPoint = commission.trend.at(-1);
  const latestCommissionValueLabel = latestCommissionPoint
    ? currencyFormatter.format(latestCommissionPoint.amount)
    : "--";

  const productContribution = productSales.map((item) => ({
    label: item.name,
    value: item.amount,
    hint: `类别 ${item.category}`,
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="本月佣金"
          value={currencyFormatter.format(commission.monthly)}
          delta={6.2}
          deltaLabel="较上月"
        />
        <MetricCard
          title="累计佣金"
          value={currencyFormatter.format(commission.total)}
          delta={15.4}
          deltaLabel="同比增长"
        />
        <MetricCard
          title="活跃伙伴"
          value={`${secondaryDistributorSummary.activeCount} 家`}
          delta={4.1}
          deltaLabel="较上月活跃"
        />
        <MetricCard
          title="待审批申请"
          value={`${secondaryDistributorSummary.pendingApprovals} 份`}
          delta={-2.0}
          deltaLabel="较上周"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  月度提成走势
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  追踪近半年提成变化，快速定位走势拐点。
                </p>
              </div>
              <div className="grid gap-2 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-500 md:text-right">
                <span>最新月份</span>
                <span className="text-sm font-semibold text-neutral-900">
                  {latestCommissionValueLabel}
                </span>
              </div>
            </header>
            <TrendChart
              className="mt-6"
              data={monthlyCommissionTrend}
              latestValueLabel={latestCommissionValueLabel}
              height={140}
            />
          </article>

          <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  产品维度销售量分析
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  按 ABC 分类呈现本月重点产品销售额，聚焦高贡献单品。
                </p>
              </div>
              <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:inline-flex">
                本月更新
              </span>
            </header>
            <div className="mt-5">
              <HorizontalBarList
                items={productContribution}
                valueFormatter={(value) => currencyFormatter.format(value)}
              />
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">
              伙伴概览
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              了解活跃度与审批进展，优先处理关键伙伴需求。
            </p>
            <div className="mt-5 grid gap-4 text-sm text-neutral-600">
              <div className="rounded-lg bg-neutral-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  活跃伙伴
                </p>
                <p className="mt-2 text-xl font-semibold text-neutral-900">
                  {secondaryDistributorSummary.activeCount} 家
                </p>
                <p className="text-xs text-neutral-500">
                  持续贡献订单的合作伙伴数量
                </p>
              </div>
              <div className="rounded-lg bg-primary/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-primary/70">
                  待审批申请
                </p>
                <p className="mt-2 text-xl font-semibold text-primary">
                  {secondaryDistributorSummary.pendingApprovals} 份
                </p>
                <p className="text-xs text-primary/70">
                  建议优先跟进，缩短审批周期
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-600">
                  长期未活跃
                </p>
                <p className="mt-2 text-xl font-semibold text-amber-600">
                  {secondaryDistributorSummary.inactiveCount} 家
                </p>
                <p className="text-xs text-amber-600">
                  建议安排复盘，评估是否调整支持策略
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              详细的伙伴画像与运营建议可在伙伴管理模块查看。
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}
