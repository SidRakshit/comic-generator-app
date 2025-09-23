// Zod schemas for Comic-related validation

import { z } from 'zod';

export const PanelStatusSchema = z.enum(['empty', 'loading', 'complete', 'error']);

export const ComicCharacterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Character name is required'),
  description: z.string().optional(),
});

export const PanelSchema = z.object({
  id: z.string(),
  status: PanelStatusSchema,
  prompt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  error: z.string().optional(),
  panelNumber: z.number().optional(),
  layoutPosition: z.record(z.unknown()).optional(),
});

export const ComicSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  genre: z.string().optional(),
  characters: z.array(ComicCharacterSchema).optional(),
  template: z.string().nullable(),
  panels: z.array(PanelSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  published: z.boolean().optional(),
});

export const TemplateDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  panelCount: z.number().positive(),
});

// Backend schemas
export const BackendComicDataSchema = z.object({
  comic_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  characters: z.array(ComicCharacterSchema).optional(),
  setting: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BackendPanelDataSchema = z.object({
  panel_id: z.string().uuid(),
  page_id: z.string().uuid(),
  panel_number: z.number(),
  image_url: z.string().url().optional(),
  prompt: z.string().optional(),
  dialogue: z.string().optional(),
  layout_position: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BackendPageDataSchema = z.object({
  page_id: z.string().uuid(),
  comic_id: z.string().uuid(),
  page_number: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  panels: z.array(BackendPanelDataSchema),
});

// Service layer schemas
export const DialogueSchema = z.object({
  character: z.string(),
  text: z.string(),
});

export const ScriptPanelSchema = z.object({
  panelNumber: z.string(),
  description: z.string(),
  dialogue: z.array(DialogueSchema).optional(),
});
