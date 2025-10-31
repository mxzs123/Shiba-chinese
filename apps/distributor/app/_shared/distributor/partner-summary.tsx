"use client";

import { PieChart, Pie, Cell, Label } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { cn } from "~/lib/utils";
import { CHART_COLORS, CHART_CONFIG } from "../../../lib/chart-theme";

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

const STATUS_PROGRESS_CLASS: Record<PartnerStatusSlice["tone"], string> = {
  primary:
    "bg-blue-100 [&_[data-slot=progress-indicator]]:bg-blue-600 [&_[data-slot=progress-indicator]]:shadow-none",
  warning:
    "bg-amber-100 [&_[data-slot=progress-indicator]]:bg-amber-500 [&_[data-slot=progress-indicator]]:shadow-none",
};

function getStatusColor(
  tone: PartnerStatusSlice["tone"],
  index: number,
): string {
  if (tone === "warning") return CHART_COLORS.status.warning;
  return (
    CHART_COLORS.data[index % CHART_COLORS.data.length] ?? CHART_COLORS.data[0]
  );
}

export function PartnerSummary({ data, className }: PartnerSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          伙伴概览
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <div className="rounded-xl bg-neutral-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              状态占比
            </p>
            <ChartContainer
              config={data.statusSlices.reduce(
                (config, slice, index) => ({
                  ...config,
                  [slice.id]: {
                    label: slice.label,
                    color: getStatusColor(slice.tone, index),
                  },
                }),
                {},
              )}
              className="mx-auto aspect-square max-h-[220px] pt-3"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                      labelClassName="text-sm font-semibold text-neutral-900"
                      nameKey="id"
                      formatter={(value, _name, item) => {
                        const payload = item?.payload as
                          | PartnerStatusSlice
                          | undefined;
                        if (!payload) {
                          return null;
                        }

                        return (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-sm text-neutral-600">
                              {payload.label}
                            </span>
                            <span className="font-mono text-sm font-semibold text-neutral-900">
                              {formatPercent(payload.ratio, 1)} ·{" "}
                              {Math.round(Number(value))} 家
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={data.statusSlices.map((slice) => ({
                    ...slice,
                    value: slice.value,
                  }))}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={CHART_CONFIG.pie.innerRadius}
                  outerRadius={CHART_CONFIG.pie.outerRadius}
                  paddingAngle={CHART_CONFIG.pie.paddingAngle}
                  strokeWidth={CHART_CONFIG.pie.strokeWidth}
                >
                  {data.statusSlices.map((slice, index) => (
                    <Cell
                      key={slice.id}
                      fill={getStatusColor(slice.tone, index)}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <g>
                            <circle
                              cx={viewBox.cx}
                              cy={viewBox.cy}
                              r={56}
                              fill="#f9fafb"
                              opacity={0.6}
                            />
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-neutral-900 text-2xl font-bold"
                              >
                                {data.activeCount}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 22}
                                className="fill-neutral-500 text-xs"
                              >
                                活跃伙伴
                              </tspan>
                            </text>
                          </g>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryTile
                label="活跃伙伴"
                value={`${data.activeCount} 家`}
                tone="primary"
              />
              <SummaryTile
                label="长期未活跃"
                value={`${data.inactiveCount} 家`}
                tone={data.inactiveCount > 0 ? "warning" : "neutral"}
              />
              <SummaryTile
                label="管理总数"
                value={`${data.totalManaged} 家`}
                tone="neutral"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                管理覆盖
              </p>
              <StatusBarList slices={data.statusSlices} />
              <p className="text-xs text-neutral-500">
                当前共管理 {data.totalManaged} 家一级/二级分销伙伴。
              </p>
            </div>
          </div>
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
          <Progress
            value={Math.round(slice.ratio * 100)}
            className={cn("h-2", STATUS_PROGRESS_CLASS[slice.tone])}
          />
        </div>
      ))}
    </div>
  );
}
