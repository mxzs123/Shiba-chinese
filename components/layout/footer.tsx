import Link from "next/link";

import FooterMenu from "components/layout/footer-menu";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/api";
import { Suspense } from "react";

const { SITE_NAME } = process.env;

export default async function Footer() {
  const skeleton = "w-full h-6 animate-pulse rounded-sm bg-neutral-200";
  const menu = await getMenu("next-js-frontend-footer-menu");

  return (
    <footer className="text-sm text-neutral-500">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-neutral-200 px-6 py-12 text-sm md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0">
        <div className="flex flex-1 flex-col gap-4 text-neutral-600">
          <Link className="flex items-center gap-2 text-black md:pt-1" href="/">
            <LogoSquare size="sm" />
            <span className="uppercase">{SITE_NAME}</span>
          </Link>
          <div className="space-y-2">
            <p className="text-neutral-900">
              日本東京都港区芝公園2-3-3 寺田ビル1階
            </p>
            <p>
              电话：
              <a
                className="text-neutral-900 hover:text-black"
                href="tel:+81364529888"
              >
                03-6452-9888
              </a>
            </p>
            <p>
              FAX：<span className="text-neutral-900">03-6452-9839</span>
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex h-[188px] w-[200px] flex-col gap-2">
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>
      </div>
    </footer>
  );
}
