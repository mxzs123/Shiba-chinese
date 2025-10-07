import { APP_TEXT } from "lib/i18n/constants";

/**
 * 全局加载状态
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-primary" />
        <p className="text-sm text-neutral-600">{APP_TEXT.common.loading}</p>
      </div>
    </div>
  );
}
