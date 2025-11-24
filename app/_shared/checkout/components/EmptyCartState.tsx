import Link from "next/link";

export function EmptyCartState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-6 py-16 text-center shadow-sm shadow-black/[0.02]">
      <h2 className="text-2xl font-semibold text-neutral-900">购物车为空</h2>
      <p className="mt-3 text-sm text-neutral-500">
        请先挑选商品加入购物车，再返回结算页完成订单。
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/cart"
          className="rounded-full border border-neutral-900 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          返回购物车
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          浏览商品
        </Link>
      </div>
    </div>
  );
}
