import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { fallbackLocale } from "@shiba/i18n";
import { initMonitoring } from "@shiba/monitoring";

import "./globals.css";

const SITE_NAME = "芝园分销平台";

initMonitoring({ serviceName: "distributor-app" });

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "芝园销售与分销运营入口",
  robots: {
    follow: true,
    index: false,
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={fallbackLocale} className={inter.variable}>
      <body className="bg-neutral-50 text-neutral-900">
        <Script id="distributor-cleanup-overlays" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var attempts = 0;
                var maxAttempts = 5;
                var clean = function () {
                  attempts += 1;
                  var overlay = document.querySelector(".region-selector-container");
                  if (overlay && overlay.parentElement) {
                    overlay.parentElement.removeChild(overlay);
                    return;
                  }
                  if (attempts < maxAttempts) {
                    requestAnimationFrame(clean);
                  }
                };
                clean();
              } catch (error) {
                // ignore cleanup errors
              }
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
