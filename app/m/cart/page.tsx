import { MobileCartContent } from "./cart-content";

export const metadata = {
  title: "购物车",
  description: "管理购物车中的商品",
};

export default function MobileCartPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-neutral-900">购物车</h1>
      </header>
      <MobileCartContent />
    </div>
  );
}
