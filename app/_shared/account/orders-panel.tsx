import { AccountOrdersView } from "./account-orders-view";
import { getCurrentUser, getUserById } from "@/lib/api";
import { loadPrescriptionComplianceOverview } from "@/lib/prescription";

function buildDisplayName(
  user: Awaited<ReturnType<typeof getCurrentUser>>,
): string | undefined {
  if (!user) {
    return undefined;
  }

  if (user.nickname) {
    return user.nickname;
  }

  const fullName = `${user.lastName ?? ""}${user.firstName ?? ""}`.trim();
  if (fullName.length > 0) {
    return fullName;
  }

  return user.email;
}

export async function AccountOrdersPanel() {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    return (
      <section className="rounded-3xl border border-neutral-100 bg-white/80 p-10 text-center shadow-lg shadow-neutral-900/5">
        <h2 className="text-xl font-semibold text-neutral-900">订单管理</h2>
        <p className="mt-3 text-sm text-neutral-500">
          暂未获取到示例用户数据，请稍后再试。
        </p>
      </section>
    );
  }

  const { orders, byOrder: prescriptionCompliance } =
    await loadPrescriptionComplianceOverview(user);
  const sortedOrders = [...orders].sort((first, second) => {
    const firstDate = new Date(first.createdAt).getTime();
    const secondDate = new Date(second.createdAt).getTime();
    return secondDate - firstDate;
  });

  const displayName = buildDisplayName(user);

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white/80 p-8 shadow-lg shadow-neutral-900/5">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">订单管理</h2>
          <p className="mt-1 text-sm text-neutral-500">
            浏览订单列表、查看状态流转并获取最新运单号。
          </p>
        </div>
        <div className="text-sm text-neutral-400">
          共 {sortedOrders.length} 笔订单
        </div>
      </header>
      <AccountOrdersView
        orders={sortedOrders}
        customerName={displayName}
        prescriptionCompliance={prescriptionCompliance}
      />
    </section>
  );
}

export default AccountOrdersPanel;
