import { cn } from "lib/utils";
import {
  SUPPORT_END_HOUR,
  SUPPORT_START_HOUR,
  getJapanSupportSchedule,
} from "lib/time/japan-support-hours";

const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function formatWorkingHours() {
  const start = `${SUPPORT_START_HOUR.toString().padStart(2, "0")}:00`;
  const end = `${SUPPORT_END_HOUR.toString().padStart(2, "0")}:00`;
  return `${start} – ${end}`;
}

type SupportHoursCalendarProps = {
  daysToDisplay?: number;
  className?: string;
};

export function SupportHoursCalendar({
  daysToDisplay = 7,
  className,
}: SupportHoursCalendarProps) {
  const schedule = getJapanSupportSchedule({ days: daysToDisplay });

  const monthRangeLabel = (() => {
    if (schedule.length === 0) return "";
    const first = schedule[0];
    const last = schedule[schedule.length - 1];
    if (!first || !last) return "";
    const sameMonth = first.year === last.year && first.month === last.month;
    if (sameMonth) {
      return `${first.year}年${first.month}月`;
    }
    const sameYear = first.year === last.year;
    if (sameYear) {
      return `${first.month}月 - ${last.month}月 (${first.year}年)`;
    }
    return `${first.year}年${first.month}月 - ${last.year}年${last.month}月`;
  })();

  const workingHours = formatWorkingHours();

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#049e6b]">
            客服时间
          </p>
          {monthRangeLabel ? (
            <span className="text-xs font-medium text-neutral-500">
              {monthRangeLabel}
            </span>
          ) : null}
        </div>
        <h3 className="text-2xl font-bold text-neutral-900">
          日本工作日 {workingHours}
        </h3>
        <p className="text-sm text-neutral-600">
          服务时段基于东京时间（JST），卡片已标注营业或休息状态，周末与日本节假日休息。
        </p>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
        role="list"
        aria-label="客服工作日程"
      >
        {schedule.map((day) => {
          const weekdayLabel = WEEKDAY_LABELS[day.weekday];
          const dayLabel = `${day.month}月${day.day}日`;

          const baseClasses =
            "flex flex-col gap-3 rounded-2xl border p-4 transition-colors duration-200";
          const stateClasses = day.isWorkingDay
            ? "border-[#049e6b]/40 bg-[#049e6b]/5 text-neutral-900"
            : "border-neutral-200 bg-white text-neutral-600";
          const todayClasses = day.isToday
            ? "ring-2 ring-[#049e6b] ring-offset-2 ring-offset-white"
            : "";

          return (
            <article
              key={day.isoDate}
              role="listitem"
              className={cn(baseClasses, stateClasses, todayClasses)}
            >
              <header className="flex items-center justify-between text-sm font-medium">
                <span className="text-neutral-500">{weekdayLabel}</span>
                {day.isToday ? (
                  <span className="rounded-full bg-[#049e6b] px-2 py-0.5 text-xs font-semibold text-white">
                    今天
                  </span>
                ) : null}
              </header>

              <p className="text-2xl font-semibold text-neutral-900">
                {dayLabel}
              </p>
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  day.isWorkingDay
                    ? "bg-[#049e6b] text-white"
                    : "bg-neutral-200 text-neutral-600",
                )}
              >
                {day.isWorkingDay ? "营业日" : "休息日"}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default SupportHoursCalendar;
