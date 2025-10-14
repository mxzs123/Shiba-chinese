"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

import type { SalesTask, SalesTaskSummary, TaskPriority } from "./data";

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  high: "bg-rose-100 text-rose-700 border-rose-100",
  medium: "bg-amber-100 text-amber-700 border-amber-100",
  low: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

interface TasksPanelProps {
  tasks: SalesTask[];
  summary: SalesTaskSummary;
  className?: string;
}

export function TasksPanel({ tasks, summary, className }: TasksPanelProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold text-neutral-900">
          每日任务清单
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="font-medium text-neutral-900">
            共 {summary.total} 项
          </span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((priority) => (
              <Badge
                key={priority}
                variant="outline"
                className={cn(
                  "border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                  PRIORITY_BADGE_CLASS[priority],
                )}
              >
                {PRIORITY_LABEL[priority]} {summary.byPriority[priority]}
              </Badge>
            ))}
          </div>
        </div>
        <ScrollArea className="mt-4 max-h-[360px] pr-4">
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                    {task.dueDate}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 text-[11px]",
                      PRIORITY_BADGE_CLASS[task.priority],
                    )}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {task.title}
                </p>
                {task.summary ? (
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    {task.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
