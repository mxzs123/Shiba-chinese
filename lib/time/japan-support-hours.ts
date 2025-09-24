import holidays from "holiday-jp/holidays.json";

export const TOKYO_TIMEZONE = "Asia/Tokyo";
export const SUPPORT_START_HOUR = 9;
export const SUPPORT_END_HOUR = 18;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOLIDAYS = holidays as Record<string, string>;

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TOKYO_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type JapanSupportDay = {
  isoDate: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  isHoliday: boolean;
  isWeekend: boolean;
  isWorkingDay: boolean;
  isToday: boolean;
  holidayName?: string;
};

export type SupportScheduleOptions = {
  startDate?: Date;
  days?: number;
};

function parseIsoDateParts(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

function toTokyoMidnight(date: Date) {
  const isoDate = isoFormatter.format(date);
  return new Date(`${isoDate}T00:00:00+09:00`);
}

export function getJapanSupportSchedule({
  startDate = new Date(),
  days = 14,
}: SupportScheduleOptions = {}): JapanSupportDay[] {
  const schedule: JapanSupportDay[] = [];
  const baseTokyoMidnight = toTokyoMidnight(startDate);
  const todayIso = isoFormatter.format(new Date());
  for (let index = 0; index < days; index += 1) {
    const current = new Date(baseTokyoMidnight.getTime() + index * DAY_IN_MS);
    const isoDate = isoFormatter.format(current);
    const { year, month, day } = parseIsoDateParts(isoDate);
    const canonicalDate = new Date(year, month - 1, day);
    const weekday = canonicalDate.getDay();

    const holidayName = HOLIDAYS[isoDate];
    const isHoliday = Boolean(holidayName);
    const isWeekend = weekday === 0 || weekday === 6;
    const isWorkingDay = !isWeekend && !isHoliday;

    schedule.push({
      isoDate,
      year,
      month,
      day,
      weekday,
      isHoliday,
      isWeekend,
      isWorkingDay,
      isToday: isoDate === todayIso,
      holidayName,
    });
  }

  return schedule;
}
