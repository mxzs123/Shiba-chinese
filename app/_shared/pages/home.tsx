import Footer from "components/layout/footer";

import { HomeCategoryNavigation } from "./home/HomeCategoryNavigation";
import { HomeHeroSection } from "./home/HomeHeroSection";
import { HomeRecommendations } from "./home/HomeRecommendations";

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
      <div className="flex flex-col gap-12 py-8 md:py-10 lg:py-12">
        <HomeHeroSection />
        <HomeCategoryNavigation />
        <HomeRecommendations />
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
