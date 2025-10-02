import { getNotifications } from "lib/api";
import { MobileHeader } from "components/layout/mobile-header";

import { MobileCartContent } from "./cart-content";

export const metadata = {
  title: "购物车",
  description: "管理购物车中的商品",
};

export default async function MobileCartPage() {
  const notifications = await getNotifications();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <MobileHeader notifications={notifications} leadingVariant="back" />
      <section className="border-b border-neutral-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-neutral-900">购物车</h1>
      </section>
      <MobileCartContent />
    </div>
  );
}
