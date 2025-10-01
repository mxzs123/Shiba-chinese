import { getCurrentUser, getUserById } from "@/lib/api";
import type {
  Membership,
  PointAccount,
  PointTransaction,
} from "@/lib/api/types";

function formatDate(value: string | undefined) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(date);
}

type AccountMembershipPanelProps = {
  variant?: "default" | "mobile";
};

function getPanelClasses(variant: "default" | "mobile") {
  if (variant === "mobile") {
    return "rounded-2xl border border-neutral-100 bg-white/90 p-6 shadow-lg shadow-neutral-900/5";
  }

  return "rounded-3xl border border-neutral-100 bg-white/90 p-8 shadow-lg shadow-neutral-900/5";
}

function getGradientPanelClasses(variant: "default" | "mobile") {
  if (variant === "mobile") {
    return "rounded-2xl border border-neutral-100 bg-gradient-to-br from-[#049e6b]/10 via-white to-white p-6 shadow-lg shadow-neutral-900/5";
  }

  return "rounded-3xl border border-neutral-100 bg-gradient-to-br from-[#049e6b]/10 via-white to-white p-8 shadow-lg shadow-neutral-900/5";
}

function getFallbackClasses(variant: "default" | "mobile") {
  if (variant === "mobile") {
    return "rounded-2xl border border-neutral-100 bg-white/80 p-6 text-center shadow-lg shadow-neutral-900/5";
  }

  return "rounded-3xl border border-neutral-100 bg-white/80 p-8 text-center shadow-lg shadow-neutral-900/5";
}

export async function AccountMembershipPanel({
  variant = "default",
}: AccountMembershipPanelProps = {}) {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    return (
      <section className={getFallbackClasses(variant)}>
        <h2 className="text-xl font-semibold text-neutral-900">会员权益</h2>
        <p className="mt-3 text-sm text-neutral-500">
          暂未获取到账户信息，请稍后再试。
        </p>
      </section>
    );
  }

  const membership = user.membership;
  const loyalty = user.loyalty;

  return (
    <section className="space-y-6">
      <MembershipCard membership={membership} variant={variant} />
      <LoyaltyCard loyalty={loyalty} variant={variant} />
    </section>
  );
}

type MembershipCardProps = {
  membership?: Membership;
  variant: "default" | "mobile";
};

function MembershipCard({ membership, variant }: MembershipCardProps) {
  if (!membership) {
    return (
      <div className={getFallbackClasses(variant)}>
        <h2 className="text-xl font-semibold text-neutral-900">会员等级</h2>
        <p className="mt-3 text-sm text-neutral-500">
          当前账号尚未加入会员，完成首单后将自动开通基础会员权益。
        </p>
      </div>
    );
  }

  return (
    <div className={getGradientPanelClasses(variant)}>
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">会员等级</h2>
          <p className="text-sm text-neutral-500">
            当前等级享受多项专属福利，持续消费可解锁更高等级。
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#049e6b] px-4 py-1 text-sm font-semibold text-white">
          {membership.tier}
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
            Lv.{membership.level}
          </span>
        </div>
      </header>

      <dl className="mt-6 grid gap-4 text-sm text-neutral-600 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-neutral-400">入会时间</dt>
          <dd className="mt-1 font-medium text-neutral-900">
            {formatDate(membership.since)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400">有效期</dt>
          <dd className="mt-1 font-medium text-neutral-900">
            {membership.expiresAt
              ? formatDate(membership.expiresAt)
              : "长期有效"}
          </dd>
        </div>
        {membership.next ? (
          <div>
            <dt className="text-xs text-neutral-400">下一等级</dt>
            <dd className="mt-1 font-medium text-neutral-900">
              {membership.next.title}
            </dd>
            <p className="text-xs text-neutral-500">
              {membership.next.requirement}
            </p>
          </div>
        ) : null}
      </dl>

      {membership.benefits?.length ? (
        <div className="mt-6 rounded-2xl border border-[#049e6b]/20 bg-white/60 p-6">
          <h3 className="text-sm font-semibold text-neutral-900">专属权益</h3>
          <ul className="mt-3 grid gap-2 text-sm text-neutral-600 lg:grid-cols-2">
            {membership.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full bg-[#049e6b]"
                  aria-hidden
                />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type LoyaltyCardProps = {
  loyalty?: PointAccount;
  variant: "default" | "mobile";
};

function LoyaltyCard({ loyalty, variant }: LoyaltyCardProps) {
  if (!loyalty) {
    return (
      <div className={getFallbackClasses(variant)}>
        <h2 className="text-xl font-semibold text-neutral-900">积分账户</h2>
        <p className="mt-3 text-sm text-neutral-500">
          当前暂无积分记录，完成订单或参与活动即可累积积分。
        </p>
      </div>
    );
  }

  const recentTransactions = loyalty.transactions.slice(0, 4);

  return (
    <div className={getPanelClasses(variant)}>
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">积分账户</h2>
          <p className="text-sm text-neutral-500">用于抵扣订单与兑换礼品。</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">当前积分余额</p>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">
            {loyalty.balance}
          </p>
          <p className="text-xs text-neutral-400">
            更新于 {formatDate(loyalty.updatedAt)}
          </p>
        </div>
      </header>

      {recentTransactions.length ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-900">
            近期积分动态
          </h3>
          <ul className="mt-3 space-y-3 text-sm text-neutral-600">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white/95 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900">
                    {resolveTransactionLabel(transaction)}
                  </span>
                  <span
                    className={
                      transaction.type === "redeem"
                        ? "text-red-500"
                        : "text-emerald-600"
                    }
                  >
                    {transaction.type === "redeem" ? "-" : "+"}
                    {transaction.amount}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span>{formatDate(transaction.occurredAt)}</span>
                  <span>余额 {transaction.balanceAfter}</span>
                  {transaction.referenceOrderId ? (
                    <span>订单 {transaction.referenceOrderId}</span>
                  ) : null}
                </div>
                {transaction.description ? (
                  <p className="text-xs text-neutral-500">
                    {transaction.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-8 text-center text-sm text-neutral-500">
          暂无积分变动记录。
        </p>
      )}
    </div>
  );
}

function resolveTransactionLabel(transaction: PointTransaction) {
  switch (transaction.type) {
    case "earn":
      return "积分获取";
    case "redeem":
      return "积分抵扣";
    case "adjust":
      return "积分调整";
    default:
      return "积分变动";
  }
}

export default AccountMembershipPanel;
