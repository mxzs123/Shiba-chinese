import { ProductContribution } from "../../_shared/sales";
import {
  CommissionHighlights,
  CommissionOverview,
  PartnerSummary,
  getDistributorDashboardViewModel,
} from "../../_shared/distributor";

export default function DistributorHomePage() {
  const viewModel = getDistributorDashboardViewModel();

  return (
    <div className="space-y-6">
      <CommissionHighlights
        commission={viewModel.commission}
        partners={viewModel.partners}
      />
      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <CommissionOverview data={viewModel.commission} />
          <ProductContribution data={viewModel.products} />
        </div>
        <aside className="space-y-6">
          <PartnerSummary data={viewModel.partners} />
        </aside>
      </section>
    </div>
  );
}
