import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { fallbackLocale } from "@shiba/i18n";

import "./globals.css";

const SITE_NAME = "芝园分销平台";

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
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
