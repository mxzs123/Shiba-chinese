import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { getCart } from "lib/api";
import { baseUrl } from "lib/utils";

import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import "./globals.css";

const DEFAULT_SITE_NAME = "芝园药局";
const siteName = process.env.SITE_NAME?.trim() || DEFAULT_SITE_NAME;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // pass the pending cart fetch to the provider so it can resolve downstream
  const cart = getCart();

  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300">
        <CartProvider cartPromise={cart}>
          <Navbar />
          <main>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
