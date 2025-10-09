import { z } from "zod";

export const distributorPartnerStatusSchema = z.enum([
  "active",
  "paused",
  "disabled",
]);
export type DistributorPartnerStatus = z.infer<
  typeof distributorPartnerStatusSchema
>;

export const distributorPartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  contact: z.string(),
  region: z.string(),
  status: distributorPartnerStatusSchema,
  joinedAt: z.string().optional(),
  note: z.string().optional(),
});
export type DistributorPartner = z.infer<typeof distributorPartnerSchema>;

export const distributorPartnerApplicationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export type DistributorPartnerApplicationStatus = z.infer<
  typeof distributorPartnerApplicationStatusSchema
>;

export const distributorPartnerApplicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  contact: z.string(),
  region: z.string(),
  status: distributorPartnerApplicationStatusSchema,
  submittedAt: z.string(),
  note: z.string().optional(),
});
export type DistributorPartnerApplication = z.infer<
  typeof distributorPartnerApplicationSchema
>;

export const distributorPartnerApplicationInputSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  region: z.string().min(1),
  note: z.string().optional(),
});
export type DistributorPartnerApplicationInput = z.infer<
  typeof distributorPartnerApplicationInputSchema
>;
