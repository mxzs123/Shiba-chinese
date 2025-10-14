"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

import type { RevenueOverviewData } from "./data";
import { formatCurrency, formatPercent } from "./formatters";

interface RevenueOverviewProps {
  data: RevenueOverviewData;
  className?: string;
  labels?: {
    title?: string;
    latestMonth?: string;
    latestValue?: string;
    growth?: string;
    series?: string;
    dailySeries?: string;
    dailyRange?: string;
    dailyUnit?: string;
  };
}

export function RevenueOverview({
  data,
  className,
  labels,
}: RevenueOverviewProps) {
  const primaryColor = "#1d4ed8";
  const primarySurface = "rgba(29, 78, 216, 0.12)";
  const primaryCursor = "rgba(29, 78, 216, 0.08)";

  const growthLabel =
    data.growthRatio === null
      ? "--"
      : `${data.growthRatio >= 0 ? "+" : ""}${formatPercent(
          data.growthRatio,
          1,
        )}`;
  const hasDailyTrend = data.dailyTrend.length > 0;
  const title = labels?.title ?? "业绩概览";
  const latestMonthCopy = labels?.latestMonth ?? "最新月份";
  const latestValueCopy = labels?.latestValue ?? "当月营收";
  const growthCopy = labels?.growth ?? "环比变化";
  const seriesLabel = labels?.series ?? "营收";
  const dailySeriesLabel = labels?.dailySeries ?? "日营收";
  const dailyRangeCopy = labels?.dailyRange ?? "近 7 天";
  const dailyUnitCopy = labels?.dailyUnit ?? "单位：日元";

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricBlock label={latestMonthCopy} value={data.latestMonthLabel} />
          <MetricBlock
            label={latestValueCopy}
            value={formatCurrency(data.latestValue)}
          />
          <MetricBlock
            label={growthCopy}
            value={data.growthRatio === null ? "--" : growthLabel}
            tone={
              data.growthRatio === null
                ? undefined
                : data.growthRatio >= 0
                  ? "positive"
                  : "negative"
            }
          />
        </div>
        <Separator />
        <ChartContainer
          className="aspect-auto h-[260px]"
          config={{
            value: {
              label: seriesLabel,
              color: primaryColor,
            },
          }}
        >
          <AreaChart data={data.monthlyTrend}>
            <defs>
              <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={primaryColor}
                  stopOpacity={0.24}
                />
                <stop
                  offset="100%"
                  stopColor={primaryColor}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="shortLabel"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              width={0}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
            />
            <ChartTooltip
              cursor={{ stroke: primarySurface, strokeWidth: 2 }}
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span className="font-mono font-semibold text-neutral-900">
                      {formatCurrency(Number(value))}
                    </span>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="url(#revenue-fill)"
              fillOpacity={1}
              dot={{ r: 4, fill: primaryColor, stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: primaryColor, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
        {hasDailyTrend ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{dailyRangeCopy}</span>
              <Badge
                variant="outline"
                className="border-neutral-200 bg-white text-[11px] text-neutral-500"
              >
                {dailyUnitCopy}
              </Badge>
            </div>
            <ChartContainer
              className="aspect-auto h-[160px] pt-2"
              config={{
                value: {
                  label: dailySeriesLabel,
                  color: primaryColor,
                },
              }}
            >
              <BarChart data={data.dailyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="shortLabel"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={6}
                />
                <YAxis axisLine={false} tickLine={false} width={0} />
                <ChartTooltip
                  cursor={{ fill: primaryCursor }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono font-medium text-neutral-900">
                          {formatCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill={primaryColor}
                  maxBarSize={18}
                />
              </BarChart>
            </ChartContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface MetricBlockProps {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}

function MetricBlock({ label, value, tone }: MetricBlockProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-lg font-semibold text-neutral-900",
          tone === "positive" && "text-primary",
          tone === "negative" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}
