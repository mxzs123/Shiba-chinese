import { APP_TEXT } from "lib/i18n/constants";

/**
 * 移动端加载状态
 */
export default function MobileLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary" />
        <p className="text-sm text-neutral-600">{APP_TEXT.common.loading}</p>
      </div>
    </div>
  );
}
