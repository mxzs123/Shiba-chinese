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
    <section className="mx-auto flex w-full max-w-5xl px-4 py-16 lg:px-0">
      <div className="flex w-full flex-col gap-12 rounded-3xl border border-neutral-200 bg-white/70 p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur lg:flex-row lg:p-12">
        <div className="flex w-full flex-col justify-center lg:w-1/2">
          <h1 className="text-3xl font-semibold text-neutral-900 lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-base text-neutral-500 lg:max-w-md">
              {description}
            </p>
          ) : null}
          {secondaryAction ? (
            <div className="mt-10 rounded-2xl bg-neutral-100/80 p-6 text-sm text-neutral-600">
              <p className="mb-3 text-neutral-700">
                {secondaryAction.description}
              </p>
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
              >
                {secondaryAction.label}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
