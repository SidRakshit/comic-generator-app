// Zod schemas for API Request/Response validation

import { z } from 'zod';
import { ComicCharacterSchema, GeneratedImageDataSchema } from './comic.schema';
import { COMIC_RULES, PASSWORD_RULES, USER_RULES } from '../constants/business-rules';

// Request schemas
export const CreateComicRequestSchema = z.object({
  title: z.string().min(COMIC_RULES.TITLE.MIN_LENGTH, 'Title is required').max(COMIC_RULES.TITLE.MAX_LENGTH, `Title must be less than ${COMIC_RULES.TITLE.MAX_LENGTH} characters`),
  description: z.string().max(COMIC_RULES.DESCRIPTION.MAX_LENGTH, `Description must be less than ${COMIC_RULES.DESCRIPTION.MAX_LENGTH} characters`).optional().or(z.literal("")),
  characters: z.array(ComicCharacterSchema).optional(),
  setting: z.record(z.unknown()).optional(),
  template: z.string().min(1, 'Template is required'),
  pages: z.array(z.object({
    page_number: z.number().positive(),
    panels: z.array(z.object({
      panel_number: z.number().positive(),
      prompt: z.string().max(COMIC_RULES.PANEL.PROMPT.MAX_LENGTH, `Prompt must be less than ${COMIC_RULES.PANEL.PROMPT.MAX_LENGTH} characters`).optional().refine(
        (val) => !val || val.length >= COMIC_RULES.PANEL.PROMPT.MIN_LENGTH,
        { message: `Prompt must be at least ${COMIC_RULES.PANEL.PROMPT.MIN_LENGTH} characters when provided` }
      ),
      layout_position: z.record(z.unknown()).optional(),
      image_base64: z.string().optional(),
    }))
  }))
});

export const UpdateComicRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().or(z.literal("")),
  characters: z.array(ComicCharacterSchema).optional(),
  setting: z.record(z.unknown()).optional(),
  pages: z.array(z.object({
    page_number: z.number().positive(),
    panels: z.array(z.object({
      panel_number: z.number().positive(),
      prompt: z.string().optional().or(z.literal("")),
      layout_position: z.record(z.unknown()).optional(),
    }))
  })).optional(),
});

export const ComicPageRequestSchema = z.object({
  page_number: z.number().positive(),
  panels: z.array(z.object({
    panel_number: z.number().positive(),
    prompt: z.string().optional(),
    layout_position: z.record(z.unknown()).optional(),
  }))
});

export const ComicPanelRequestSchema = z.object({
  panel_number: z.number().positive(),
  prompt: z.string().optional(),
  layout_position: z.record(z.unknown()).optional(),
});

export const GenerateImageRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

export const GeneratePanelImageRequestSchema = z.object({
  panelDescription: z.string().min(COMIC_RULES.PANEL.PROMPT.MIN_LENGTH, `Panel description must be at least ${COMIC_RULES.PANEL.PROMPT.MIN_LENGTH} characters`).max(COMIC_RULES.PANEL.PROMPT.MAX_LENGTH, `Panel description must be less than ${COMIC_RULES.PANEL.PROMPT.MAX_LENGTH} characters`),
  characterContext: z.string().optional(),
});


export const UpdateUserProfileRequestSchema = z.object({
  display_name: z.string().max(USER_RULES.USERNAME.MAX_LENGTH, `Display name must be less than ${USER_RULES.USERNAME.MAX_LENGTH} characters`).optional(),
  bio: z.string().max(USER_RULES.BIO.MAX_LENGTH, `Bio must be less than ${USER_RULES.BIO.MAX_LENGTH} characters`).optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Valid email is required').max(USER_RULES.EMAIL.MAX_LENGTH, 'Email is too long'),
  password: z.string().min(PASSWORD_RULES.MIN_LENGTH, `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`).max(PASSWORD_RULES.MAX_LENGTH, `Password must be less than ${PASSWORD_RULES.MAX_LENGTH} characters`),
});

export const SignupRequestSchema = z.object({
  email: z.string().email('Valid email is required').max(USER_RULES.EMAIL.MAX_LENGTH, 'Email is too long'),
  password: z.string().min(PASSWORD_RULES.MIN_LENGTH, PASSWORD_RULES.REQUIREMENTS_TEXT).max(PASSWORD_RULES.MAX_LENGTH, `Password must be less than ${PASSWORD_RULES.MAX_LENGTH} characters`).regex(PASSWORD_RULES.STRENGTH_REGEX, PASSWORD_RULES.REQUIREMENTS_TEXT),
  confirmPassword: z.string().min(PASSWORD_RULES.MIN_LENGTH, `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`),
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
  cover_image_url: z.string().url().optional(),
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
