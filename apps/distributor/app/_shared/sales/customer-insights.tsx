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

import type { CustomerInsightsData } from "./data";
import { formatPercent } from "./formatters";
import { cn } from "~/lib/utils";

interface CustomerInsightsProps {
  data: CustomerInsightsData;
  className?: string;
}

export function CustomerInsights({ data, className }: CustomerInsightsProps) {
  const primaryColor = "#1d4ed8";
  const primaryMuted = "rgba(29, 78, 216, 0.35)";
  const primaryCursor = "rgba(29, 78, 216, 0.08)";

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
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              性别比例
            </p>
            <ChartContainer
              className="aspect-auto h-[220px]"
              config={{
                女: {
                  label: "女性",
                  color: primaryColor,
                },
                男: {
                  label: "男性",
                  color: primaryMuted,
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
                  innerRadius={48}
                  outerRadius={76}
                  strokeWidth={6}
                >
                  {data.gender.map((slice) => (
                    <Cell
                      key={slice.label}
                      fill={slice.label === "女" ? primaryColor : primaryMuted}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-neutral-500">{name}</span>
                          <span className="font-mono font-medium text-neutral-900">
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
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                年龄结构
              </p>
              {data.dominantAgeGroup ? (
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-white text-[11px] text-neutral-500"
                >
                  主力 {data.dominantAgeGroup.range}
                </Badge>
              ) : null}
            </div>
            <ChartContainer
              className="aspect-auto h-[220px] pt-2"
              config={{
                ratio: {
                  label: "占比",
                  color: primaryColor,
                },
              }}
            >
              <BarChart
                data={data.ageGroups.map((group) => ({
                  name: group.range,
                  ratio: Math.round(group.ratio * 100),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <ChartTooltip
                  cursor={{ fill: primaryCursor }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-neutral-500">{name}</span>
                          <span className="font-mono font-medium text-neutral-900">
                            {formatPercent(Number(value) / 100, 0)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="ratio"
                  radius={[6, 6, 0, 0]}
                  fill={primaryColor}
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
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
