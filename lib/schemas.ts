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

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type RegisterDealerInput = z.infer<typeof RegisterDealerSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateDealerProfileInput = z.infer<typeof UpdateDealerProfileSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;