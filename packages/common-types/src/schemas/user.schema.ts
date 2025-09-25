// Zod schemas for User-related validation

import { z } from 'zod';

export const UserSchema = z.object({
  user_id: z.string().uuid(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  auth_provider_id: z.string(),
});

export const UserProfileSchema = z.object({
  profile_id: z.string().uuid(),
  user_id: z.string().uuid(),
  display_name: z.string().max(100).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ComicListItemSchema = z.object({
  comic_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  panel_count: z.number().nonnegative(),
  published: z.boolean(),
});

// Backend service schemas
export const UserModelSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  created_at: z.date(),
});
