"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_CONFIG } from "~/lib/chart-theme";

import type { CustomerInsightsData } from "./data";
import { formatPercent } from "./formatters";
import { cn } from "~/lib/utils";

interface CustomerInsightsProps {
  data: CustomerInsightsData;
  className?: string;
}

export function CustomerInsights({ data, className }: CustomerInsightsProps) {
  const genderColors = {
    女: CHART_COLORS.primary.DEFAULT,
    男: CHART_COLORS.data[1], // 紫色
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          客户洞察
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatBlock label="客户总数" value={`${data.total}`} />
          <StatBlock label="本月新增" value={`${data.newThisMonth}`} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              性别比例
            </p>
            <ChartContainer
              className="aspect-auto h-[230px]"
              config={{
                女: {
                  label: "女性",
                  color: genderColors.女,
                },
                男: {
                  label: "男性",
                  color: genderColors.男,
                },
              }}
            >
              <PieChart>
                <Pie
                  data={data.gender.map((slice) => ({
                    name: slice.label,
                    value: slice.ratio,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.gender.map((slice) => (
                    <Cell
                      key={slice.label}
                      fill={genderColors[slice.label as "女" | "男"]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                      labelClassName="text-sm font-semibold text-neutral-900"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-sm text-neutral-600">
                            {name}
                          </span>
                          <span className="font-mono font-semibold text-neutral-900">
                            {formatPercent(Number(value), 0)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend
                  verticalAlign="bottom"
                  content={<ChartLegendContent nameKey="name" />}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                年龄结构
              </p>
              {data.dominantAgeGroup ? (
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-white text-[11px] font-medium text-neutral-600"
                >
                  主力 {data.dominantAgeGroup.range}
                </Badge>
              ) : null}
            </div>
            <ChartContainer
              className="aspect-auto h-[230px] pt-3"
              config={{
                ratio: {
                  label: "占比",
                  color: CHART_COLORS.primary.DEFAULT,
                },
              }}
            >
              <BarChart
                data={data.ageGroups.map((group) => ({
                  name: group.range,
                  ratio: Math.round(group.ratio * 100),
                }))}
              >
                <CartesianGrid
                  strokeDasharray={CHART_CONFIG.grid.strokeDasharray}
                  strokeOpacity={CHART_CONFIG.grid.strokeOpacity}
                  stroke={CHART_CONFIG.grid.stroke}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={6}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <ChartTooltip
                  cursor={{ fill: CHART_COLORS.alpha.primary8 }}
                  content={
                    <ChartTooltipContent
                      className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                      labelClassName="text-sm font-semibold text-neutral-900"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-sm text-neutral-600">
                            {name}
                          </span>
                          <span className="font-mono font-semibold text-neutral-900">
                            {formatPercent(Number(value) / 100, 0)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="ratio"
                  radius={CHART_CONFIG.bar.radius}
                  fill={CHART_COLORS.primary.DEFAULT}
                  maxBarSize={CHART_CONFIG.bar.maxSize}
                  activeBar={{
                    fill: CHART_COLORS.primary.dark,
                  }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatBlockProps {
  label: string;
  value: string;
}

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="rounded-xl bg-neutral-50 p-4 hover:shadow-sm transition-shadow duration-200">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
