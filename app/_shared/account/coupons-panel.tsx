import { getCurrentUser, getCustomerCoupons, getUserById } from "@/lib/api";

import CouponsManager from "./coupons/coupons-manager";

export async function AccountCouponsPanel({
  showTitle = true,
  showDescription = true,
}: { showTitle?: boolean; showDescription?: boolean } = {}) {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    return (
      <section className="rounded-3xl border border-neutral-100 bg-white/80 p-8 text-center shadow-lg shadow-neutral-900/5">
        <h2 className="text-xl font-semibold text-neutral-900">优惠券</h2>
        <p className="mt-3 text-sm text-neutral-500">
          暂未获取到账户信息，请稍后再试。
        </p>
      </section>
    );
  }

  const coupons = await getCustomerCoupons(user.id);

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white/90 p-8 shadow-lg shadow-neutral-900/5">
      <header className="mb-6 space-y-1">
        {showTitle ? (
          <h2 className="text-xl font-semibold text-neutral-900">优惠券</h2>
        ) : null}
        {showDescription ? (
          <p className="text-sm text-neutral-500">
            查看账户已有优惠券，输入兑换码即可添加到个人中心。
          </p>
        ) : null}
      </header>
      <CouponsManager userId={user.id} coupons={coupons} />
    </section>
  );
}

export default AccountCouponsPanel;
