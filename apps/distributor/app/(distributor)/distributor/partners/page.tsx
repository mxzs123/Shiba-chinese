import { ModulePlaceholder } from "../../../../components/module-placeholder";
import { fetchMockPartners, shouldUseMock } from "../../../../lib/mock/server-actions";
import { PartnersClient } from "./partners-client";

export default async function DistributorPartnersPage() {
  if (!shouldUseMock()) {
    return (
      <section className="space-y-6">
        <ModulePlaceholder
          title="伙伴服务暂未接通"
          description="当前环境未启用 Mock 数据，无法展示伙伴管理功能。"
        >
          请先开启 API Mock 或接入真实接口后再访问此模块。
        </ModulePlaceholder>
      </section>
    );
  }

  const initialData = await fetchMockPartners();
  return <PartnersClient initialData={initialData} />;
}
