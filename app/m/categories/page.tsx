import { getNotifications } from "lib/api";
import { MobileHeader } from "components/layout/mobile-header";
import { MobileCategoriesContent } from "./categories-content";

export const metadata = {
  title: "商品分类",
  description: "浏览所有商品分类",
};

export default async function MobileCategoriesPage() {
  const notifications = await getNotifications();

  return (
    <div className="flex h-screen flex-col">
      <MobileHeader notifications={notifications} />
      <div className="flex flex-1 overflow-hidden">
        <MobileCategoriesContent />
      </div>
    </div>
  );
}
