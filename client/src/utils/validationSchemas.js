import { z } from 'zod';

// Register schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'freelancer'], {
    required_error: 'Please select a role'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

// Profile update schema
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  skills: z.array(z.string())
    .optional(),
  hourlyRate: z.string()
    .transform((val) => val === '' ? undefined : Number(val))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), 'Hourly rate cannot be negative')
    .optional(),
  location: z.string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional(),
  portfolio: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''))
});

// Gig validation schema
export const gigSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  
  price: z.string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 5, 'Price must be at least $5')
    .refine((val) => !isNaN(val) && val <= 10000, 'Price cannot exceed $10,000'),
  
  category: z.string()
    .min(1, 'Please select a category'),
  
  deliveryTime: z.string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, 'Delivery time must be at least 1 day')
    .refine((val) => !isNaN(val) && val <= 30, 'Delivery time cannot exceed 30 days'),
  
  tags: z.array(z.string())
    .min(1, 'Please add at least one tag')
    .max(5, 'Maximum 5 tags allowed'),
  
  images: z.array(z.any())
    .max(5, 'Maximum 5 images allowed')
    .optional()
});
