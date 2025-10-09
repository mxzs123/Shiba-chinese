interface HorizontalBarItem {
  label: string;
  value: number;
  hint?: string;
  emphasis?: string;
}

interface HorizontalBarListProps {
  items: HorizontalBarItem[];
  valueFormatter?: (value: number) => string;
  unitLabel?: string;
}

export function HorizontalBarList({
  items,
  valueFormatter,
  unitLabel,
}: HorizontalBarListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        暂无数据
      </div>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const percent = Math.round((item.value / max) * 100);
        const formattedValue = valueFormatter
          ? valueFormatter(item.value)
          : item.value;

        return (
          <li key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="font-medium text-neutral-900">
                  {item.label}
                </span>
                {item.hint ? (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                    {item.hint}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                {item.emphasis ? (
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {item.emphasis}
                  </span>
                ) : null}
                <span className="font-medium text-neutral-900">
                  {formattedValue} {unitLabel ?? ""}
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
                aria-hidden
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
