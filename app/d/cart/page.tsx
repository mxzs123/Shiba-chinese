import CartContent from "./cart-content";

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">购物车</h1>
        <p className="mt-2 text-sm text-neutral-500">
          查看已加入的商品，调整数量并准备结算。
        </p>
      </header>
      <CartContent />
    </div>
  );
}
