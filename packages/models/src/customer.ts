import { z } from "zod";

export const customerGenderSchema = z.enum(["male", "female", "unknown"]);
export type CustomerGender = z.infer<typeof customerGenderSchema>;

export const customerTypeSchema = z.enum(["personal", "distributor"]);
export type CustomerType = z.infer<typeof customerTypeSchema>;

export const customerLevelSchema = z.enum([
  "standard",
  "vip",
  "vvip",
  "prospect",
]);
export type CustomerLevel = z.infer<typeof customerLevelSchema>;

export const customerStatusSchema = z.enum([
  "in_progress",
  "converted",
  "paused",
  "lost",
]);
export type CustomerStatus = z.infer<typeof customerStatusSchema>;

export const customerSourceSchema = z.enum([
  "official_site",
  "agency",
  "overseas_clinic",
  "sns",
  "member_event",
  "referral",
]);
export type CustomerSource = z.infer<typeof customerSourceSchema>;

export const customerRegionSchema = z.object({
  country: z.string(),
  province: z.string().optional(),
  city: z.string().optional(),
});
export type CustomerRegion = z.infer<typeof customerRegionSchema>;

export const customerContactSchema = z.object({
  phone: z.string().optional(),
  wechat: z.string().optional(),
  email: z.string().optional(),
});
export type CustomerContact = z.infer<typeof customerContactSchema>;

export const customerFollowUpChannelSchema = z.enum([
  "call",
  "wechat",
  "meeting",
  "message",
  "email",
  "other",
]);
export type CustomerFollowUpChannel = z.infer<
  typeof customerFollowUpChannelSchema
>;

export const customerFollowUpStatusSchema = z.enum([
  "pending",
  "completed",
  "cancelled",
]);
export type CustomerFollowUpStatus = z.infer<
  typeof customerFollowUpStatusSchema
>;

export const customerFollowUpSchema = z.object({
  id: z.string(),
  title: z.string(),
  plannedAt: z.string(),
  channel: customerFollowUpChannelSchema,
  status: customerFollowUpStatusSchema,
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CustomerFollowUp = z.infer<typeof customerFollowUpSchema>;

export const customerFollowUpCreateSchema = z.object({
  title: z.string().min(1),
  plannedAt: z.string(),
  channel: customerFollowUpChannelSchema,
  notes: z.string().optional(),
});
export type CustomerFollowUpCreateInput = z.infer<
  typeof customerFollowUpCreateSchema
>;

export const customerFollowUpUpdateSchema = customerFollowUpCreateSchema
  .partial()
  .extend({
    status: customerFollowUpStatusSchema.optional(),
  });
export type CustomerFollowUpUpdateInput = z.infer<
  typeof customerFollowUpUpdateSchema
>;

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: customerGenderSchema,
  birthDate: z.string().optional(),
  age: z.number().int().positive().optional(),
  region: customerRegionSchema,
  contact: customerContactSchema,
  address: z.string().optional(),
  type: customerTypeSchema,
  level: customerLevelSchema,
  status: customerStatusSchema,
  source: customerSourceSchema,
  registeredAt: z.string(),
  lastFollowUpAt: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  salesOwner: z.string(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  totalOrders: z.number().int().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  recentOrderId: z.string().optional(),
  followUps: z.array(customerFollowUpSchema),
});
export type Customer = z.infer<typeof customerSchema>;
