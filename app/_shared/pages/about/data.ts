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
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const companyInfo: InfoRow[] = [
  {
    id: "entity-name",
    label: "公司名称",
    value: "芝园健康科技（上海）有限公司",
    helperText: "Shiyuan Health Technology (Shanghai) Co., Ltd.",
  },
  {
    id: "entity-address",
    label: "注册地址",
    value: "上海市杨浦区政益路 88 号 A 座 502 室",
    helperText: "邮编 200082 | 示例地址，后续请同步工商登记信息",
  },
  {
    id: "entity-contact",
    label: "联系方式",
    value: "客服热线：400-123-0000",
    helperText: "传真：021-0000-0001 | 邮箱：support@shiyuan.example.com",
  },
  {
    id: "entity-representative",
    label: "法定代表人",
    value: "陈芝园",
    helperText: "董事长兼首席执行官",
  },
  {
    id: "entity-founded",
    label: "成立日期",
    value: "2021 年 5 月",
    helperText: "统一社会信用代码：91310110MXYZ12345N",
  },
  {
    id: "entity-capital",
    label: "注册资本",
    value: "人民币 5,000,000 元",
    helperText: "实缴资本待完成验资，以财务报表为准",
  },
  {
    id: "entity-scope",
    label: "经营范围",
    value: "药品零售、保健食品销售、健康管理咨询（以审批结果为准）",
  },
  {
    id: "entity-service",
    label: "客服时间",
    value: "周一至周日 09:00-21:00 (GMT+8)",
    helperText: "公众号：芝园药局 | 小程序：芝园健康",
  },
];

export const complianceItems: ComplianceItem[] = [
  {
    id: "gsp-license",
    label: "药品经营许可证",
    licenseNumber: "沪DA1234567",
    expiresAt: "有效期至 2027 年 12 月 31 日",
    note: "覆盖处方药、特管药品经营范围，更新后请同步原件扫描件。",
    status: "待上传 PDF",
  },
  {
    id: "food-license",
    label: "食品经营许可证",
    licenseNumber: "沪SP5630001",
    expiresAt: "有效期至 2026 年 06 月 30 日",
    note: "涉及保健食品、特殊膳食产品的销售与配送。",
    status: "待上传 PDF",
  },
  {
    id: "device-record",
    label: "第二类医疗器械经营备案",
    licenseNumber: "沪药监械经营备 20240001 号",
    note: "覆盖血糖仪、理疗仪等器械，如有新品请提前补充备案。",
    status: "待上传 PDF",
  },
  {
    id: "narcotic-permit",
    label: "含麻黄碱类复方制剂经营许可",
    licenseNumber: "沪禁化管准字第 0401 号",
    note: "若业务暂未开启，可在此注明“暂未经营”并附函说明。",
    status: "待上传 PDF",
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "faq-cooperation",
    question: "如何与芝园建立业务合作？",
    answer:
      "请发送邮件至 partners@shiyuan.example.com，附上公司简介与合作方向，商务团队将在 3 个工作日内回复。",
  },
  {
    id: "faq-license-update",
    question: "经营许可证更新节奏是怎样的？",
    answer:
      "合规资料通常每 5 年换证一次，如遇到监管变更或经营范围扩展，请在获批后的 5 个工作日内同步至线上页面并归档。",
  },
  {
    id: "faq-complaint",
    question: "消费者投诉渠道有哪些？",
    answer:
      "可通过客服热线、微信公众号“芝园药局”或发邮件至 compliance@shiyuan.example.com，我们会在 24 小时内响应。",
  },
  {
    id: "faq-materials",
    question: "需要纸质版企业信息时如何获取？",
    answer:
      "可联系合规团队提供盖章版资料，请在工单或邮件中说明用途，我们会在 2 个工作日内寄出。",
  },
];
