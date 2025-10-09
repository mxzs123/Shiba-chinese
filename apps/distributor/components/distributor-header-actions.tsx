"use client";

import { FilterDrawer } from "./filter-drawer";

export function DistributorHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <FilterDrawer title="筛选伙伴">
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              伙伴等级
            </h3>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>核心伙伴</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>成长伙伴</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>观察期</span>
              </label>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              活跃度
            </h3>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="activity" defaultChecked />
                <span>近30天活跃</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="activity" />
                <span>近90天活跃</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="activity" />
                <span>长期未活跃</span>
              </label>
            </div>
          </section>
        </div>
      </FilterDrawer>
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
      >
        新建伙伴
      </button>
    </div>
  );
}
