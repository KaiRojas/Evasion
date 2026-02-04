/**
 * Vehicle Validation Schemas
 */

import { z } from 'zod';

/**
 * Create/Update vehicle schema
 */
export const vehicleSchema = z.object({
  make: z
    .string()
    .min(1, 'Make is required')
    .max(50, 'Make must be less than 50 characters'),
  
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model must be less than 50 characters'),
  
  year: z
    .number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 2, 'Invalid year'),
  
  color: z
    .string()
    .max(30, 'Color must be less than 30 characters')
    .optional()
    .nullable(),
  
  vin: z
    .string()
    .length(17, 'VIN must be exactly 17 characters')
    .regex(/^[A-HJ-NPR-Z0-9]+$/, 'Invalid VIN format')
    .optional()
    .nullable(),
  
  licensePlate: z
    .string()
    .max(15, 'License plate must be less than 15 characters')
    .optional()
    .nullable(),
  
  nickname: z
    .string()
    .max(50, 'Nickname must be less than 50 characters')
    .optional()
    .nullable(),
  
  modifications: z
    .array(z.object({
      category: z.string(),
      name: z.string(),
      brand: z.string().optional(),
      description: z.string().optional(),
    }))
    .optional()
    .default([]),
  
  specs: z
    .object({
      engine: z.string().optional(),
      transmission: z.string().optional(),
      drivetrain: z.string().optional(),
      fuelType: z.string().optional(),
    })
    .optional()
    .default({}),
  
  photos: z
    .array(z.string().url())
    .max(10, 'Maximum 10 photos allowed')
    .optional()
    .default([]),
  
  isPrimary: z
    .boolean()
    .optional()
    .default(false),
  
  isPublic: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * Vehicle stats schema
 */
export const vehicleStatsSchema = z.object({
  horsepower: z.number().positive().optional().nullable(),
  torque: z.number().positive().optional().nullable(),
  quarterMile: z.number().positive().optional().nullable(),
  zeroToSixty: z.number().positive().optional().nullable(),
  topSpeed: z.number().positive().optional().nullable(),
  totalMiles: z.number().int().positive().optional().nullable(),
});

// Type exports
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleStatsInput = z.infer<typeof vehicleStatsSchema>;
