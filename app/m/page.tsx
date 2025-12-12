import { HomeActivityNotice } from "@/app/_shared/pages/home/HomeActivityNotice";
import { HomeAdvantagesSection } from "@/app/_shared/pages/home/HomeAdvantagesSection";
import { HomeHeroSection } from "@/app/_shared/pages/home/HomeHeroSection";
import { HomeRecommendations } from "@/app/_shared/pages/home/HomeRecommendations";
import { HomeSupportScheduleSection } from "@/app/_shared/pages/home/HomeSupportScheduleSection";
import { MobileQuickCategoryShortcuts } from "@/app/_shared/pages/home/MobileQuickCategoryShortcuts";
import Footer from "@/components/layout/footer";
import { MobileHeader } from "@/components/layout/mobile-header";
import { getNotifications } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "首页",
  description: "Shiba 医药电商 - 移动端",
  openGraph: {
    type: "website",
  },
};

export default async function MobileHomePage() {
  const notifications = await getNotifications();

  return (
    <>
      <MobileHeader notifications={notifications} />
      <div className="flex flex-col gap-6 px-4 pt-4">
        <HomeHeroSection />
        <MobileQuickCategoryShortcuts />
        <HomeActivityNotice />
        <HomeRecommendations showBadge={false} />
        <HomeAdvantagesSection />
        <HomeSupportScheduleSection />
      </div>
      <Footer />
    </>
  );
}
