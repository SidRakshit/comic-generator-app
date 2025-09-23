// Zod schemas for API Request/Response validation

import { z } from 'zod';
import { ComicCharacterSchema, GeneratedImageDataSchema } from './comic.schema';

// Request schemas
export const CreateComicRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  characters: z.array(ComicCharacterSchema).optional(),
  setting: z.record(z.unknown()).optional(),
  template: z.string().min(1, 'Template is required'),
  pages: z.array(z.object({
    page_number: z.number().positive(),
    panels: z.array(z.object({
      panel_number: z.number().positive(),
      prompt: z.string().optional(),
      dialogue: z.string().optional(),
      layout_position: z.record(z.unknown()).optional(),
    }))
  }))
});

export const UpdateComicRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  characters: z.array(ComicCharacterSchema).optional(),
  setting: z.record(z.unknown()).optional(),
  pages: z.array(z.object({
    page_number: z.number().positive(),
    panels: z.array(z.object({
      panel_number: z.number().positive(),
      prompt: z.string().optional(),
      dialogue: z.string().optional(),
      layout_position: z.record(z.unknown()).optional(),
    }))
  })).optional(),
});

export const ComicPageRequestSchema = z.object({
  page_number: z.number().positive(),
  panels: z.array(z.object({
    panel_number: z.number().positive(),
    prompt: z.string().optional(),
    dialogue: z.string().optional(),
    layout_position: z.record(z.unknown()).optional(),
  }))
});

export const ComicPanelRequestSchema = z.object({
  panel_number: z.number().positive(),
  prompt: z.string().optional(),
  dialogue: z.string().optional(),
  layout_position: z.record(z.unknown()).optional(),
});

export const GenerateImageRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

export const UpdateUserProfileRequestSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Response schemas
export const ComicResponseSchema = z.object({
  comic_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  characters: z.array(ComicCharacterSchema).optional(),
  setting: z.record(z.unknown()).optional(),
  template: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  pages: z.array(z.object({
    page_id: z.string().uuid(),
    comic_id: z.string().uuid(),
    page_number: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    panels: z.array(z.object({
      panel_id: z.string().uuid(),
      page_id: z.string().uuid(),
      panel_number: z.number(),
      image_url: z.string().url().optional(),
      prompt: z.string().optional(),
      dialogue: z.string().optional(),
      layout_position: z.record(z.unknown()).optional(),
      created_at: z.string(),
      updated_at: z.string(),
    }))
  })).optional(),
});

export const ComicsListResponseSchema = z.object({
  comics: z.array(z.object({
    comic_id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    panel_count: z.number().nonnegative(),
    published: z.boolean(),
  })),
  total: z.number().nonnegative(),
  page: z.number().positive(),
  limit: z.number().positive(),
});

export const ComicListItemResponseSchema = z.object({
  comic_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  panel_count: z.number().nonnegative(),
  published: z.boolean(),
});

// Use unified GeneratedImageData schema
export const GeneratedImageDataResponseSchema = GeneratedImageDataSchema;

export const UserResponseSchema = z.object({
  user_id: z.string().uuid(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UserProfileResponseSchema = z.object({
  profile_id: z.string().uuid(),
  user_id: z.string().uuid(),
  display_name: z.string().max(100).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    user_id: z.string().uuid(),
    username: z.string().optional(),
    email: z.string().email().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  profile: z.object({
    profile_id: z.string().uuid(),
    user_id: z.string().uuid(),
    display_name: z.string().max(100).optional(),
    bio: z.string().optional(),
    avatar_url: z.string().url().optional(),
    preferences: z.record(z.unknown()).optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }).optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

// Generic API response wrapper - this is a function that takes a schema
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: ErrorResponseSchema.optional(),
  message: z.string().optional(),
});