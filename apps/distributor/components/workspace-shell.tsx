import Link from "next/link";
import type { ReactNode } from "react";

import type { Session } from "@shiba/models";

import { LogoutButton } from "./logout-button";
import { WorkspaceNav } from "./workspace-nav";

export interface WorkspaceNavItem {
  label: string;
  href: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface WorkspaceShellProps {
  title: string;
  subtitle?: string;
  session: Session;
  navItems: WorkspaceNavItem[];
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  announcement?: ReactNode;
  children: ReactNode;
}

const ROLE_LABEL: Record<Session["role"], string> = {
  sales: "销售人员",
  distributor: "分销商",
  secondary: "二级分销商",
};

export function WorkspaceShell({
  title,
  subtitle,
  session,
  navItems,
  breadcrumbs,
  actions,
  announcement,
  children,
}: WorkspaceShellProps) {
  const environmentFlag =
    process.env.DISTRIBUTOR_ENVIRONMENT ??
    (process.env.API_USE_MOCK === "false" ? "Production" : "Mock");
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <aside className="hidden w-60 flex-col border-r border-neutral-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-6 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              芝园分销平台
            </p>
            <EnvironmentBadge className="mt-2" value={environmentFlag} />
          </div>
          <div className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
            当前角色：{ROLE_LABEL[session.role]}
          </div>
        </div>
        <WorkspaceNav items={navItems} />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-4 border-b border-neutral-200 bg-white px-6 py-4">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                芝园分销平台
              </p>
              <EnvironmentBadge value={environmentFlag} />
            </div>
            {hasBreadcrumbs ? (
              <nav
                aria-label="当前位置导航"
                className="flex flex-wrap items-center gap-1 text-xs text-neutral-400"
              >
                {breadcrumbs!.map((item, index) => {
                  const isLast = index === breadcrumbs!.length - 1;
                  return (
                    <span
                      key={`${item.label}-${index}`}
                      className="flex items-center gap-1"
                    >
                      {item.href && !isLast ? (
                        <Link
                          href={item.href}
                          className="transition-colors hover:text-primary"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-neutral-500">{item.label}</span>
                      )}
                      {!isLast ? (
                        <span className="text-neutral-300">/</span>
                      ) : null}
                    </span>
                  );
                })}
              </nav>
            ) : null}
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-sm text-neutral-500">{subtitle}</p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <WorkspaceNav
              items={navItems}
              orientation="horizontal"
              className="lg:hidden"
            />
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-neutral-500 lg:inline">
                当前角色：{ROLE_LABEL[session.role]}
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>
        {announcement ? (
          <div className="border-b border-neutral-200 bg-amber-50 px-6 py-3 text-sm text-amber-700">
            {announcement}
          </div>
        ) : null}
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

function EnvironmentBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const baseClass =
    "inline-flex items-center rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-500";

  return (
    <span className={className ? `${baseClass} ${className}` : baseClass}>
      {value}
    </span>
  );
}
