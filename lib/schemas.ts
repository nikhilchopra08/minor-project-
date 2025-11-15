import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
});

export const RegisterDealerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email("Invalid business email").optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  description: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateUserProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateDealerProfileSchema = z.object({
  businessName: z.string().optional(),
  businessEmail: z.string().email("Invalid business email").optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  description: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});


// Service Schemas
export const CreateServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive").optional(),
  duration: z.number().min(1, "Duration must be at least 1 hour").optional(),
});

export const UpdateServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  duration: z.number().min(1, "Duration must be at least 1 hour").optional(),
  isActive: z.boolean().optional(),
});

// Package Schemas
export const CreatePackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().min(1, "Duration must be at least 1 day").optional(),
  serviceIds: z.array(z.string()).min(1, "At least one service is required"),
});

export const UpdatePackageSchema = z.object({
  name: z.string().min(1, "Package name is required").optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  duration: z.number().min(1, "Duration must be at least 1 day").optional(),
  isActive: z.boolean().optional(),
  serviceIds: z.array(z.string()).min(1, "At least one service is required").optional(),
});

export const AdminQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  search: z.string().optional(),
  role: z.enum(['USER', 'DEALER', 'ADMIN']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type RegisterDealerInput = z.infer<typeof RegisterDealerSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateDealerProfileInput = z.infer<typeof UpdateDealerProfileSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
export type CreatePackageInput = z.infer<typeof CreatePackageSchema>;
export type UpdatePackageInput = z.infer<typeof UpdatePackageSchema>;

export type AdminQueryInput = z.infer<typeof AdminQuerySchema>;