import { z } from "zod";

export const userRoleSchema = z.enum(["sales", "distributor", "secondary"]);

export type UserRole = z.infer<typeof userRoleSchema>;

export const permissionSchema = z.string();

export const sessionSchema = z.object({
  id: z.string(),
  role: userRoleSchema,
  permissions: z.array(permissionSchema),
  expiresAt: z.string().datetime().optional(),
});

export type Session = z.infer<typeof sessionSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: userRoleSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
