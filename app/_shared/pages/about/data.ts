export type InfoRow = {
  id: string;
  label: string;
  value: string;
  helperText?: string;
};

export type ComplianceItem = {
  id: string;
  label: string;
  licenseNumber: string;
  expiresAt?: string;
  note?: string;
  status: string;
  href?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const companyInfo: InfoRow[] = [
  { id: "entity-name", label: "公司名称", value: "株式会社芝園薬局（日本）" },
  { id: "entity-address", label: "地址", value: "日本東京都港区芝公園2−3-3 寺田ビル1階" },
  { id: "entity-phone", label: "联系电话", value: "03-6452-9888" },
  { id: "entity-wechat", label: "微信公众号", value: "芝园药局" },
  { id: "entity-representative", label: "法定代表人", value: "大久保 宏一" },
  { id: "entity-founded", label: "成立日期", value: "2025年10月" },
  { id: "entity-capital", label: "注册资本", value: "500万日元" },
  {
    id: "entity-scope",
    label: "经营范围",
    value: "医药品零售，保健食品销售，健康管理咨询",
  },
];

export const complianceItems: ComplianceItem[] = [
  {
    id: "pharmacy-license",
    label: "薬局開設許可証",
    licenseNumber: "—",
    status: "已公布",
    href: "/about/薬局開設許可証.pdf",
  },
];

export const faqItems: FaqItem[] = [];
