import Link from "next/link";
import type { ReactNode } from "react";

interface SecondaryAction {
  label: string;
  href: string;
  description?: string;
}

interface MobileAuthPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  secondaryAction?: SecondaryAction;
}

export function MobileAuthPageShell({
  title,
  description,
  children,
  secondaryAction,
}: MobileAuthPageShellProps) {
  return (
    <section className="flex min-h-screen flex-col bg-neutral-50">
      <header className="bg-white px-4 pb-8 pt-12 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            {description}
          </p>
        ) : null}
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 pb-12 pt-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(4,157,106,0.12)]">
          {children}
        </div>
        {secondaryAction ? (
          <div className="rounded-2xl border border-dashed border-[#049d6a]/30 bg-white/60 p-5 text-sm text-neutral-600">
            {secondaryAction.description ? (
              <p className="leading-relaxed">{secondaryAction.description}</p>
            ) : null}
            <Link
              href={secondaryAction.href}
              className="mt-3 inline-flex items-center font-semibold text-[#049d6a] transition-colors hover:text-[#037d54]"
            >
              {secondaryAction.label}
              <svg
                className="ml-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
