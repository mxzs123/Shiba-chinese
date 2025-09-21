import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { CartProvider } from "components/cart/cart-context";
import Footer from "components/layout/footer";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import { getCart } from "lib/api";
import { baseUrl } from "lib/utils";

const DEFAULT_SITE_NAME = "芝园药局";
const DEFAULT_SITE_DESCRIPTION =
  "芝园药局提供医药健康商品浏览、筛选、下单与支付的桌面端体验。";

const siteName = process.env.SITE_NAME?.trim() || DEFAULT_SITE_NAME;
const siteDescription =
  process.env.SITE_DESCRIPTION?.trim() || DEFAULT_SITE_DESCRIPTION;
const canonicalUrl = new URL("/", baseUrl).toString();

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: baseUrl,
    siteName,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export default function DesktopShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cartPromise = getCart();

  return (
    <CartProvider cartPromise={cartPromise}>
      <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-40 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          跳至主要内容
        </a>
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <Navbar />
        </header>
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </div>
      <Toaster closeButton />
      <WelcomeToast />
    </CartProvider>
  );
}
