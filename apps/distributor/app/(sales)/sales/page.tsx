import {
  CustomerInsights,
  ProductContribution,
  RevenueOverview,
  TasksPanel,
  getSalesDashboardViewModel,
} from "../../_shared/sales";

export default function SalesHomePage() {
  const viewModel = getSalesDashboardViewModel();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_1.85fr]">
        <TasksPanel
          tasks={viewModel.tasks.items}
          summary={viewModel.tasks.summary}
        />
        <RevenueOverview data={viewModel.revenue} />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ProductContribution data={viewModel.products} />
        <CustomerInsights data={viewModel.customers} />
      </section>
    </div>
  );
}
