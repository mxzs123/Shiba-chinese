"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import { TrendingUp, AlertCircle, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { cn } from "~/lib/utils";
import { CHART_COLORS } from "../../../lib/chart-theme";

import type { PartnerStatusSlice, PartnerSummaryData } from "./data";
import { formatPercent } from "../sales/formatters";

interface PartnerSummaryProps {
  data: PartnerSummaryData;
  className?: string;
}

const STATUS_STYLES: Record<PartnerStatusSlice["tone"], { bg: string; border: string; icon: string; progress: string }> = {
  primary: {
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    icon: "text-blue-600",
    progress: "bg-blue-100 [&_[data-slot=progress-indicator]]:bg-blue-600",
  },
  warning: {
    bg: "bg-amber-50/50",
    border: "border-amber-100",
    icon: "text-amber-600",
    progress: "bg-amber-100 [&_[data-slot=progress-indicator]]:bg-amber-500",
  },
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
    <Card className={cn("flex flex-col h-full bg-white", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-neutral-900">
          伙伴概览
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pb-6">
        {/* Chart Section */}
        <div className="relative py-4">
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
              className="mx-auto aspect-square w-full max-w-[180px]"
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
                  innerRadius={60}
                  outerRadius={72}
                  strokeWidth={0}
                  paddingAngle={4}
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
                              {data.totalManaged}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-neutral-500 text-xs font-medium"
                            >
                              总数
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
        </div>

        {/* Status Cards */}
        <div className="mt-auto grid gap-3">
          {data.statusSlices.map((slice) => (
            <StatusRow key={slice.id} slice={slice} />
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-neutral-100">
          <div className="flex items-start gap-2 text-xs text-neutral-500">
            <Users className="h-3.5 w-3.5 mt-0.5 text-neutral-400" />
            <p className="leading-relaxed">
               共有 <span className="font-semibold text-neutral-900">{data.totalManaged}</span> 家分销伙伴。
               需关注 <span className="font-medium text-amber-600">{data.inactiveCount} 家长期未活跃</span> 伙伴的情况。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusRowProps {
  slice: PartnerStatusSlice;
}

function StatusRow({ slice }: StatusRowProps) {
  const style = STATUS_STYLES[slice.tone];
  const Icon = slice.tone === "primary" ? TrendingUp : AlertCircle;

  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", style.bg)}>
        <Icon className={cn("h-4 w-4", style.icon)} />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700">{slice.label}</span>
          <span className="font-bold text-neutral-900">
            {slice.value} <span className="text-xs font-normal text-neutral-500">家</span>
          </span>
        </div>
        <Progress 
          value={Math.round(slice.ratio * 100)} 
          className={cn("h-1.5", style.progress)} 
        />
      </div>
    </div>
  );
}
