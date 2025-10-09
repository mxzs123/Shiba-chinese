import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  footer?: ReactNode;
  icon?: ReactNode;
}

export function MetricCard({
  title,
  value,
  delta,
  deltaLabel,
  footer,
  icon,
}: MetricCardProps) {
  const deltaValue = typeof delta === "number" ? formatDelta(delta) : null;

  return (
    <div className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">
            {value}
          </p>
        </div>
        {icon ? <div className="text-3xl text-primary/80">{icon}</div> : null}
      </header>
      {deltaValue ? (
        <div className="mt-4 text-sm">
          <span className={deltaValue.className}>{deltaValue.label}</span>
          {deltaLabel ? (
            <span className="ml-2 text-neutral-500">{deltaLabel}</span>
          ) : null}
        </div>
      ) : null}
      {footer ? (
        <div className="mt-4 text-xs text-neutral-500">{footer}</div>
      ) : null}
    </div>
  );
}

function formatDelta(delta: number) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const percent = Math.abs(delta).toFixed(1);

  if (isPositive) {
    return {
      label: `↑ ${percent}%` as const,
      className: "font-medium text-emerald-600",
    };
  }

  if (isNegative) {
    return {
      label: `↓ ${percent}%` as const,
      className: "font-medium text-rose-600",
    };
  }

  return {
    label: "持平" as const,
    className: "font-medium text-neutral-500",
  };
}
