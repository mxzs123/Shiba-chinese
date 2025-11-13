import AccountLink from "components/account/account-link";
import CartLink from "components/cart/cart-link";
import NotificationLink from "components/notifications/notification-link";
import LogoSquare from "components/logo-square";
import { getMenu, getNotifications } from "lib/api";
import { Menu } from "lib/api/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");
  const notifications = await getNotifications();
  // 在内测版或显式开关下隐藏“个人中心”入口（仅 UI 层处理）。
  const hideAccount =
    process.env.HIDE_ACCOUNT === "1" ||
    process.env.NEXT_PUBLIC_HIDE_ACCOUNT === "1" ||
    process.env.MOCK_MODE === "1" ||
    process.env.NEXT_PUBLIC_MOCK_MODE === "1" ||
    process.env.INTERNAL_TESTING === "1" ||
    process.env.NEXT_PUBLIC_INTERNAL_TESTING === "1";
  // 内测阶段隐藏消息通知入口（仅 UI 层，不影响服务端取数）。
  const hideNotifications =
    process.env.INTERNAL_TESTING === "1" ||
    process.env.NEXT_PUBLIC_INTERNAL_TESTING === "1" ||
    process.env.MOCK_MODE === "1" ||
    process.env.NEXT_PUBLIC_MOCK_MODE === "1";

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-2/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>
          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-3 md:w-1/3">
          <div className="hidden items-center md:flex md:w-1/2 md:justify-end">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          {/* 内测阶段隐藏消息通知入口 */}
          {hideNotifications ? null : (
            <NotificationLink notifications={notifications} />
          )}
          {/* 内测阶段隐藏个人中心入口 */}
          {hideAccount ? null : <AccountLink />}
          <CartLink />
        </div>
      </div>
    </nav>
  );
}
