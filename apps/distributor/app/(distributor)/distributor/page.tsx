import {
  CommissionHighlights,
  CommissionOverview,
  PartnerSummary,
  ProductDistributionChart,
  ProductDistributionLeaderboard,
  getDistributorDashboardViewModel,
} from "../../_shared/distributor";

export default function DistributorHomePage() {
  const viewModel = getDistributorDashboardViewModel();

  return (
    <div className="space-y-6 p-6 bg-neutral-50/30 min-h-screen">
      <CommissionHighlights
        commission={viewModel.commission}
        partners={viewModel.partners}
      />
      <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <CommissionOverview data={viewModel.commission} className="h-full" />
        <PartnerSummary data={viewModel.partners} className="h-full" />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ProductDistributionChart data={viewModel.products} />
        <ProductDistributionLeaderboard data={viewModel.products} />
      </section>
    </div>
  );
}
