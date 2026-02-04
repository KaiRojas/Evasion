/**
 * User Profile Validation Schemas
 */

import { z } from 'zod';

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
  
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable(),
  
  homeLatitude: z
    .number()
    .min(-90)
    .max(90)
    .optional()
    .nullable(),
  
  homeLongitude: z
    .number()
    .min(-180)
    .max(180)
    .optional()
    .nullable(),
});

/**
 * Privacy settings schema
 */
export const privacySettingsSchema = z.object({
  showOnlineStatus: z.boolean().default(true),
  showLocation: z.enum(['everyone', 'friends', 'nobody']).default('friends'),
  showVehicles: z.enum(['everyone', 'friends', 'nobody']).default('everyone'),
  showRoutes: z.enum(['everyone', 'friends', 'nobody']).default('everyone'),
  allowFriendRequests: z.boolean().default(true),
  allowEventInvites: z.boolean().default(true),
  allowDirectMessages: z.enum(['everyone', 'friends', 'nobody']).default('friends'),
});

/**
 * Username change schema
 */
export const changeUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;
