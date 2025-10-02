import { MobileHeader } from "@/components/layout/mobile-header";
import MobileContentContainer from "@/app/_shared/layouts/mobile-content-container";
import { getNews, getNotifications } from "@/lib/api";

import { MobileNewsList } from "./mobile-list";

export default async function SharedMobileNewsPage() {
  const [articles, notifications] = await Promise.all([
    getNews(),
    getNotifications(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <MobileHeader notifications={notifications} leadingVariant="back" />
      <div className="bg-gradient-to-b from-neutral-50 via-white to-white">
        <MobileContentContainer className="space-y-6 pb-14 pt-8">
          <header className="space-y-3 text-neutral-900">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary">
              资讯中心
            </span>
            <h1 className="text-2xl font-semibold">芝园新闻与健康指南</h1>
            <p className="text-sm leading-6 text-neutral-600">
              掌握用药提醒、服务升级与会员活动精选，移动端专属阅读体验随时了解芝园动态。
            </p>
          </header>

          <MobileNewsList articles={articles} initialCount={6} step={3} />
        </MobileContentContainer>
      </div>
    </div>
  );
}
