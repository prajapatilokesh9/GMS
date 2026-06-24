import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  logoUrl: z.string().max(500).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  logoUrl: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const createSupplementSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  mrp: z.number().positive(),
  unit: z.string().max(50).default('unit'),
  unitValue: z.string().max(50).optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateSupplementSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  unit: z.string().max(50).optional(),
  unitValue: z.string().max(50).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const createOrderSchema = z.object({
  gymId: z.string().uuid(),
  supplementId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  trackingId: z.string().max(255).optional(),
  returnReason: z.string().optional(),
});
