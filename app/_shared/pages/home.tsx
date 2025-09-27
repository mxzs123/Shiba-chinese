import Footer from "components/layout/footer";

import { HomeActivityNotice } from "./home/HomeActivityNotice";
import { HomeAdvantagesSection } from "./home/HomeAdvantagesSection";
import { HomeCategoryNavigation } from "./home/HomeCategoryNavigation";
import { HomeHeroSection } from "./home/HomeHeroSection";
import { HomeNewsSection } from "./home/HomeNewsSection";
import { HomeQuickCategoryShortcuts } from "./home/HomeQuickCategoryShortcuts";
import { HomeRecommendations } from "./home/HomeRecommendations";
import { HomeSupportScheduleSection } from "./home/HomeSupportScheduleSection";

export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js and a pluggable commerce backend.",
  openGraph: {
    type: "website",
  },
};

export function HomePage() {
  return (
    <>
      <HomeQuickCategoryShortcuts />
      <HomeActivityNotice />
      <div className="flex flex-col gap-12 pt-2 pb-4 md:pt-3 md:pb-6 lg:pt-4 lg:pb-8">
        <HomeHeroSection />
        <HomeCategoryNavigation />
        <HomeNewsSection />
        <HomeRecommendations />
        <HomeAdvantagesSection />
        <HomeSupportScheduleSection />
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
