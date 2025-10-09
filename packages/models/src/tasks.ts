import { z } from "zod";

export const taskPrioritySchema = z.enum(["high", "medium", "low"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dueDate: z.string(),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  owner: z.string().optional(),
  relatedCustomerId: z.string().optional(),
  relatedCustomerName: z.string().optional(),
  relatedOrderId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
});
export type Task = z.infer<typeof taskSchema>;

export const taskUpdateSchema = z.object({
  status: taskStatusSchema.optional(),
  notes: z.string().optional(),
});
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
