import { SupportHoursCalendar } from "components/support/SupportHoursCalendar";
import { cn } from "lib/utils";

type HomeSupportScheduleSectionProps = {
  className?: string;
};

export function HomeSupportScheduleSection({
  className,
}: HomeSupportScheduleSectionProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-(--breakpoint-2xl) px-4",
        "sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="rounded-3xl border border-[#049e6b]/20 bg-white p-8 shadow-sm dark:border-[#049e6b]/25 dark:bg-neutral-950 md:p-12">
        <SupportHoursCalendar />
      </div>
    </section>
  );
}

export default HomeSupportScheduleSection;
