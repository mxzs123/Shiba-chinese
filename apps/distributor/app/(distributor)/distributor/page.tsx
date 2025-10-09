import { MetricCard } from "../../../components/metric-card";
import { DataTable } from "../../../components/data-table";
import { distributorDashboardMock } from "../../../lib/mock/distributor-dashboard";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

type ProductRow = (typeof distributorDashboardMock.productSales)[number];

export default function DistributorHomePage() {
  const { commission, productSales, secondaryDistributorSummary } =
    distributorDashboardMock;

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

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">
            渠道热销产品
          </h2>
          <DataTable<ProductRow>
            data={productSales}
            columns={[
              { header: "产品", accessor: "name" as const },
              {
                header: "销售额",
                cell: (row) => currencyFormatter.format(row.amount ?? 0),
                align: "right",
              },
            ]}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">伙伴概览</h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-center justify-between">
                <span>活跃伙伴</span>
                <span className="font-semibold text-neutral-900">
                  {secondaryDistributorSummary.activeCount} 家
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>待审批申请</span>
                <span className="font-semibold text-primary">
                  {secondaryDistributorSummary.pendingApprovals} 份
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>长期未活跃</span>
                <span className="font-semibold text-amber-600">
                  {secondaryDistributorSummary.inactiveCount} 家
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              更多伙伴画像将在伙伴管理模块中展示，可按分层策略进行重点运营。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
