import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

import type { PartnerStatusSlice, PartnerSummaryData } from "./data";
import { formatPercent } from "../sales/formatters";

interface PartnerSummaryProps {
  data: PartnerSummaryData;
  className?: string;
}

const TILE_TONES = {
  neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
  primary: "border-primary/20 bg-primary/5 text-primary",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
} satisfies Record<"neutral" | "primary" | "warning", string>;

export function PartnerSummary({ data, className }: PartnerSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          伙伴概览
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <div className="grid gap-3">
          <SummaryTile
            label="活跃伙伴"
            value={`${data.activeCount} 家`}
            tone="primary"
          />
          <SummaryTile
            label="待审批"
            value={`${data.pendingApprovals} 份`}
            tone={data.pendingApprovals > 0 ? "warning" : "neutral"}
          />
          <SummaryTile
            label="长期未活跃"
            value={`${data.inactiveCount} 家`}
            tone={data.inactiveCount > 0 ? "warning" : "neutral"}
          />
        </div>
        <Separator />
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            管理覆盖
          </p>
          <StatusBarList slices={data.statusSlices} />
          <p className="text-xs text-neutral-500">
            当前共管理 {data.totalManaged} 家一级/二级分销伙伴。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryTileProps {
  label: string;
  value: string;
  tone: keyof typeof TILE_TONES;
}

function SummaryTile({ label, value, tone }: SummaryTileProps) {
  return (
    <div className={cn("rounded-xl border p-4", TILE_TONES[tone])}>
      <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

interface StatusBarListProps {
  slices: PartnerStatusSlice[];
}

function StatusBarList({ slices }: StatusBarListProps) {
  if (slices.length === 0) {
    return <p className="text-xs text-neutral-500">暂无伙伴数据。</p>;
  }

  return (
    <div className="space-y-3">
      {slices.map((slice) => (
        <div key={slice.id} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{slice.label}</span>
            <span className="font-mono font-medium text-neutral-900">
              {formatPercent(slice.ratio, 1)}
            </span>
          </div>
          <Progress value={Math.round(slice.ratio * 100)} className="h-2" />
        </div>
      ))}
    </div>
  );
}
