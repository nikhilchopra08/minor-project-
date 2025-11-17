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

// Quote Request Schemas
export const QuoteRequestSchema = z.object({
  location: z.string().min(1, "Location is required"),
  currentSetup: z.string().optional(),
  powerUsage: z.string().min(1, "Power usage information is required"),
  renovationType: z.enum([
    'PANEL_CLEANING',
    'INVERTER_UPGRADE', 
    'EFFICIENCY_IMPROVEMENT',
    'WIRING_SAFETY_UPGRADE',
    'PANEL_REPLACEMENT',
    'SOLAR_MIGRATION',
    'COMPLETE_RENOVATION',
    'CUSTOM'
  ]),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  dealerId: z.string().uuid("Invalid dealer ID"),
});

export const QuoteResponseSchema = z.object({
  proposedServices: z.string().min(1, "Proposed services description is required"),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  breakdown: z.array(z.object({
    service: z.string().min(1, "Service name is required"),
    description: z.string().optional(),
    amount: z.number().min(0, "Service amount must be positive"),
    duration: z.number().min(1, "Duration must be at least 1 hour").optional(),
  })).min(1, "At least one service breakdown is required"),
  timeline: z.string().min(1, "Timeline estimate is required"),
  warranty: z.string().optional(),
  notes: z.string().optional(),
});

export const QuoteRevisionSchema = z.object({
  proposedServices: z.string().min(1, "Proposed services description is required").optional(),
  totalAmount: z.number().min(0, "Total amount must be positive").optional(),
  breakdown: z.array(z.object({
    service: z.string().min(1, "Service name is required"),
    description: z.string().optional(),
    amount: z.number().min(0, "Service amount must be positive"),
    duration: z.number().min(1, "Duration must be at least 1 hour").optional(),
  })).min(1, "At least one service breakdown is required").optional(),
  timeline: z.string().min(1, "Timeline estimate is required").optional(),
  warranty: z.string().optional(),
  notes: z.string().optional(),
});

export const QuoteQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  status: z.enum(['PENDING', 'RESPONDED', 'REVISED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
});

// Booking Schemas
export const CreateBookingSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format (24-hour)"),
  estimatedHours: z.number().min(1, "Estimated hours must be at least 1").max(12, "Cannot book more than 12 hours"),
  specialNotes: z.string().max(500, "Special notes cannot exceed 500 characters").optional().default(""),
  location: z.string().min(5, "Location must be at least 5 characters").max(200, "Location cannot exceed 200 characters"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
  contactEmail: z.string().email("Valid email is required"),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']),
  cancellationReason: z.string().optional(),
});

export const BookingQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  month: z.string().optional(), // Format: "2024-01"
  year: z.string().optional(),
});

// Updated Availability Schemas to match Prisma model
// Updated Availability Schemas
export const CreateAvailabilitySchema = z.object({
  date: z.string({
    invalid_type_error: "Date must be a string"
  }).regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  isAvailable: z.boolean().default(true),
});

export const UpdateAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  isAvailable: z.boolean().optional(),
  id: z.string().optional(),
});

export const BulkAvailabilitySchema = z.object({
  availabilities: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    isAvailable: z.boolean().default(true),
  })).min(1, "At least one availability entry is required"),
});

export const AvailabilityQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  dealerId: z.string().uuid().optional(),
});

export const CheckAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  dealerId: z.string().uuid("Invalid dealer ID"),
});

// Additional schemas for dealer operations
export const DealerServicesQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const DealerPackagesQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  isActive: z.boolean().optional(),
});

export const ServiceSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  category: z.string().optional(),
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
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

export type QuoteRequestInput = z.infer<typeof QuoteRequestSchema>;
export type QuoteResponseInput = z.infer<typeof QuoteResponseSchema>;
export type QuoteRevisionInput = z.infer<typeof QuoteRevisionSchema>;
export type QuoteQueryInput = z.infer<typeof QuoteQuerySchema>;

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
export type BookingQueryInput = z.infer<typeof BookingQuerySchema>;

// Updated availability types
export type CreateAvailabilityInput = z.infer<typeof CreateAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>;
export type BulkAvailabilityInput = z.infer<typeof BulkAvailabilitySchema>;
export type AvailabilityQueryInput = z.infer<typeof AvailabilityQuerySchema>;
export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;

// Additional types
export type DealerServicesQueryInput = z.infer<typeof DealerServicesQuerySchema>;
export type DealerPackagesQueryInput = z.infer<typeof DealerPackagesQuerySchema>;
export type ServiceSearchInput = z.infer<typeof ServiceSearchSchema>;