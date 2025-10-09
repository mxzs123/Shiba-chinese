import type { Session } from "@shiba/models";

type AnnouncementMap = Partial<Record<Session["role"], string>> & {
  default?: string;
};

export const mockAnnouncements: AnnouncementMap = {
  default: "系统正在使用 Mock 数据，仅供内部联调，真实数据将在后续对接。",
  sales: "今日需跟进的重点订单已同步至任务看板，请优先完成高优先级客户回访。",
  distributor: "二级伙伴申请审批通道开放中，请及时审核最近三天提交的申请。",
};
