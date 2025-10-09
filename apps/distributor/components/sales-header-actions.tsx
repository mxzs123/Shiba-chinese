"use client";

import { FilterDrawer } from "./filter-drawer";

export function SalesHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <FilterDrawer title="快速筛选">
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              时间范围
            </h3>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="time" defaultChecked />
                <span>本月</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="time" />
                <span>本季度</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="time" />
                <span>本年度</span>
              </label>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              客户类型
            </h3>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>企业客户</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>个人客户</span>
              </label>
            </div>
          </section>
        </div>
      </FilterDrawer>
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        导出报表
      </button>
    </div>
  );
}
