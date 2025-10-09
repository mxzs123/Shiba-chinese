import { ModulePlaceholder } from "../../../../components/module-placeholder";

export default function SalesOrdersPage() {
  return (
    <section className="space-y-6">
      <ModulePlaceholder
        title="订单列表"
        description="订单全链路将在此展示，包含支付状态、履约进度与异常提醒。"
      >
        功能规划：订单列表、智能筛选、批量导出、售后协同。
      </ModulePlaceholder>
    </section>
  );
}
