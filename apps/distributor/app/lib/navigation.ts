import type { WorkspaceNavItem } from "../../components/workspace-shell";

export const SALES_NAV_ITEMS: WorkspaceNavItem[] = [
  { label: "主页", href: "/sales" },
  { label: "订单列表", href: "/sales/orders" },
  { label: "顾客管理", href: "/sales/customers" },
  { label: "任务中心", href: "/sales/tasks" },
  { label: "个人中心", href: "/sales/profile" },
];

export const DISTRIBUTOR_NAV_ITEMS: WorkspaceNavItem[] = [
  { label: "主页", href: "/distributor" },
  { label: "订单列表", href: "/distributor/orders" },
  { label: "二级分销商管理", href: "/distributor/partners" },
  { label: "个人中心", href: "/distributor/profile" },
];

export const SALES_BREADCRUMBS = [{ label: "销售中心" }];

export const DISTRIBUTOR_BREADCRUMBS = [{ label: "分销中心" }];
