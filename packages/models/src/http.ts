import { z } from "zod";

export const apiResponseEnvelopeSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type ApiResponseEnvelope = z.infer<typeof apiResponseEnvelopeSchema>;

export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  apiResponseEnvelopeSchema.extend({ data: dataSchema.optional() });

export type ApiResponse<T> = ApiResponseEnvelope & {
  data?: T;
};

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
