import Link from "next/link";
import type { ReactNode } from "react";

interface SecondaryAction {
  label: string;
  href: string;
  description?: string;
}

interface AuthPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  secondaryAction?: SecondaryAction;
}

export function AuthPageShell({
  title,
  description,
  children,
  secondaryAction,
}: AuthPageShellProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-6xl px-4 py-16 lg:px-0">
      <div className="flex w-full flex-col gap-16 lg:flex-row lg:items-center lg:gap-20">
        {/* 左侧内容 */}
        <div className="flex w-full flex-col justify-center lg:w-5/12">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">
              {description}
            </p>
          ) : null}
          {secondaryAction ? (
            <div className="mt-12 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 shadow-sm">
              <p className="text-sm text-neutral-600">
                {secondaryAction.description}
              </p>
              <Link
                href={secondaryAction.href}
                className="mt-4 inline-flex items-center text-sm font-semibold text-[#049d6a] transition-colors hover:text-[#037d54]"
              >
                {secondaryAction.label}
                <svg
                  className="ml-2 h-4 w-4"
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

        {/* 右侧表单 */}
        <div className="w-full lg:w-7/12">
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(4,157,106,0.08)] lg:p-10">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
