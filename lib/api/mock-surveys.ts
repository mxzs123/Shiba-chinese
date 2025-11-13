import { thisYear } from "./mock-shared";
import type { SurveyAssignment, SurveyTemplate } from "./types";
import { products, getPlaceholderFor } from "./mock-products";

const adhdProduct = products.find(
  (product) => product.id === "prod-adhd-medication",
)!;

const adhdSurveyTemplate: SurveyTemplate = {
  id: "survey-template-adhd",
  title: "ADHD 用药随访问卷",
  description: "请确认近期的就诊情况、药物反应与使用目的，便于药师复核。",
  category: "rx:adhd",
  productTags: ["rx:adhd"],
  questions: [
    {
      id: "adhd-symptom-notes",
      type: "text",
      title: "近 30 天用药与症状变化",
      description: "请概述服药频率、是否按照医嘱调整剂量以及症状缓解情况。",
      required: true,
      placeholder: "例如：每日早晨 1 粒，症状保持稳定，无明显副作用。",
      maxLength: 400,
    },
    {
      id: "adhd-side-effects",
      type: "single_choice",
      title: "是否出现副作用",
      description: "若存在不适，请在备注中补充具体表现。",
      options: [
        { value: "none", label: "未出现副作用" },
        { value: "mild", label: "出现轻微副作用，可自行缓解" },
        { value: "severe", label: "出现明显副作用，已联系医生" },
      ],
      required: true,
    },
    {
      id: "adhd-reason",
      type: "multiple_choice",
      title: "本次购买的主要目的",
      description: "可多选，帮助我们了解复购背景。",
      options: [
        { value: "focus", label: "维持专注度" },
        { value: "inventory", label: "补齐库存，防止断档" },
        { value: "doctor", label: "医生建议继续服用" },
        { value: "other", label: "其他" },
      ],
      minChoices: 1,
      maxChoices: 3,
    },
    {
      id: "adhd-last-visit",
      type: "date",
      title: "最近一次复诊日期",
      description: "如暂未复诊，可填写计划复诊日期。",
      required: true,
    },
    {
      id: "adhd-id-proof",
      type: "upload",
      title: "处方/诊断证明",
      description: "请上传处方或医生开具的诊断证明照片，最多 2 张。",
      accept: ["image/jpeg", "image/png", "image/webp"],
      maxFiles: 2,
      maxSizeMB: 5,
    },
  ],
  updatedAt: `${thisYear}-04-20T12:00:00.000Z`,
};

const surveyAssignmentPending: SurveyAssignment = {
  id: "survey-assignment-ord-demo-002-adhd",
  userId: "user-demo",
  orderId: "ord-demo-002",
  orderNumber: "ORD-00002",
  category: "rx:adhd",
  templateId: adhdSurveyTemplate.id,
  productIds: [adhdProduct.id],
  productTitles: [adhdProduct.title],
  createdAt: `${thisYear}-04-27T14:15:00.000Z`,
  updatedAt: `${thisYear}-04-27T14:15:00.000Z`,
  status: "pending",
  answers: [
    {
      questionId: "adhd-symptom-notes",
      value: "坚持每日早晨服用 18mg，症状保持稳定。",
    },
    {
      questionId: "adhd-side-effects",
      value: "none",
    },
    {
      questionId: "adhd-reason",
      value: ["focus", "inventory"],
    },
    {
      questionId: "adhd-last-visit",
      value: `${thisYear}-04-12`,
    },
    {
      questionId: "adhd-id-proof",
      value: [],
    },
  ],
};

const surveyAssignmentSubmitted: SurveyAssignment = {
  id: "survey-assignment-ord-demo-000-adhd",
  userId: "user-demo",
  orderId: "ord-demo-000",
  orderNumber: "ORD-00000",
  category: "rx:adhd",
  templateId: adhdSurveyTemplate.id,
  productIds: [adhdProduct.id],
  productTitles: [adhdProduct.title],
  createdAt: `${thisYear}-03-22T10:10:00.000Z`,
  updatedAt: `${thisYear}-03-23T09:10:00.000Z`,
  submittedAt: `${thisYear}-03-23T09:10:00.000Z`,
  status: "submitted",
  answers: [
    {
      questionId: "adhd-symptom-notes",
      value: "按照医嘱每日上午 1 粒，注意力明显提升。",
    },
    {
      questionId: "adhd-side-effects",
      value: "mild",
    },
    {
      questionId: "adhd-reason",
      value: ["doctor"],
    },
    {
      questionId: "adhd-last-visit",
      value: `${thisYear}-03-18`,
    },
    {
      questionId: "adhd-id-proof",
      value: [
        {
          id: "proof-front",
          name: "prescription-front.jpg",
          url: getPlaceholderFor("survey-proof-placeholder"),
          uploadedAt: `${thisYear}-03-23T09:08:00.000Z`,
        },
      ],
    },
  ],
};

export const surveyTemplates: SurveyTemplate[] = [adhdSurveyTemplate];
export const surveyAssignments: SurveyAssignment[] = [
  surveyAssignmentPending,
  surveyAssignmentSubmitted,
];
