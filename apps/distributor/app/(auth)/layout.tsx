import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Script from "next/script";

import { HydrationSafeContainer } from "../../components/hydration-safe-container";
import { getSession } from "../../lib/auth";

const AUTH_CONTAINER_CLASS =
  "flex min-h-screen items-center justify-center bg-neutral-100 px-6 py-12";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <>
      <Script id="auth-shell-guard" strategy="beforeInteractive">
        {`(() => {
  const CLASS_NAME = ${JSON.stringify(AUTH_CONTAINER_CLASS)};
  const SELECTOR = '[data-hydration-safe]';

  function normalize(node) {
    if (!node) return;
    if (node.className !== CLASS_NAME) {
      node.className = CLASS_NAME;
    }
    if (node.hasAttribute("style")) {
      node.removeAttribute("style");
    }
  }

  function connectObserver(node) {
    if (!node) return;
    const observer = new MutationObserver(() => normalize(node));
    observer.observe(node, { attributes: true, attributeFilter: ["class", "style"] });
  }

  function init() {
    const node = document.querySelector(SELECTOR);
    if (!node) {
      return false;
    }
    normalize(node);
    connectObserver(node);
    return true;
  }

  if (!init()) {
    const pending = new MutationObserver(() => {
      if (init()) {
        pending.disconnect();
      }
    });
    pending.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => {
      if (init()) {
        pending.disconnect();
      }
    });
  }
})();`}
      </Script>
      <HydrationSafeContainer className={AUTH_CONTAINER_CLASS}>
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          {children}
        </div>
      </HydrationSafeContainer>
    </>
  );
}
