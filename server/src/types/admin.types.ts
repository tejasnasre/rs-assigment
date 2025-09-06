import { z } from "zod";

// Validation schema for creating a normal user
export const createNormalUserSchema = z.object({
  name: z.string().min(3).max(60),
  email: z.email(),
  password: z.string().min(8),
  address: z.string().max(400).optional(),
});

// Validation schema for creating an admin user
export const createAdminUserSchema = z.object({
  name: z.string().min(3).max(60),
  email: z.email(),
  password: z.string().min(8),
  address: z.string().max(400).optional(),
});

// Validation schema for creating a store owner
export const createStoreOwnerSchema = z.object({
  name: z.string().min(3).max(60),
  email: z.email(),
  password: z.string().min(8),
  address: z.string().max(400).optional(),
});

// Validation schema for creating a store
export const createStoreSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  address: z.string().min(5).max(400),
  description: z.string().optional(),
  phone: z.string().max(20).optional(),
  ownerId: z.string().uuid(),
});

// Validation schema for updating a user's role
export const updateUserRoleSchema = z.object({
  role: z.enum(["system_administrator", "normal_user", "store_owner"]),
});

// TypeScript interfaces based on the schemas
export type CreateNormalUserRequest = z.infer<typeof createNormalUserSchema>;
export type CreateAdminUserRequest = z.infer<typeof createAdminUserSchema>;
export type CreateStoreOwnerRequest = z.infer<typeof createStoreOwnerSchema>;
export type CreateStoreRequest = z.infer<typeof createStoreSchema>;
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>;
