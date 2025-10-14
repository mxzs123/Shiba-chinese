"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ProductContributionItem } from "./data";
import { formatCurrency, formatPercent } from "./formatters";
import { cn } from "~/lib/utils";

interface ProductContributionProps {
  data: ProductContributionItem[];
  className?: string;
}

export function ProductContribution({
  data,
  className,
}: ProductContributionProps) {
  const primaryColor = "#1d4ed8";
  const primaryCursor = "rgba(29, 78, 216, 0.08)";

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          产品贡献
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <ChartContainer
          className="aspect-auto h-[220px]"
          config={{
            amount: {
              label: "销售额",
              color: primaryColor,
            },
          }}
        >
          <BarChart
            data={data.map((item) => ({
              name: item.name,
              amount: item.amount,
            }))}
            layout="vertical"
            margin={{ left: 80, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <ChartTooltip
              cursor={{ fill: primaryCursor }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-neutral-500">{name}</span>
                      <span className="font-mono font-medium text-neutral-900">
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="amount"
              radius={[0, 6, 6, 0]}
              fill={primaryColor}
              maxBarSize={18}
            />
          </BarChart>
        </ChartContainer>
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-white text-[11px] text-neutral-500"
                >
                  类别 {item.category}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={Math.round(item.ratio * 100)} />
                <span className="text-xs font-medium text-neutral-500">
                  {formatPercent(item.ratio, 1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
