import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { baseUrl, validateEnvironmentVariables } from "lib/utils";
import { ErrorBoundary } from "components/error-boundary";

import "./globals.css";

validateEnvironmentVariables();

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
