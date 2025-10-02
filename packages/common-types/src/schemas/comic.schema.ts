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

// Unified GeneratedImageData schema
export const GeneratedImageDataSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  promptUsed: z.string().min(1, 'Prompt used is required'),
});

// ComicContextType schema
export const ComicContextTypeSchema = z.object({
  // Original properties
  comic: ComicSchema,
  isLoading: z.boolean(),
  isSaving: z.boolean(),
  error: z.string().nullable(),
  setTemplate: z.function().args(z.string().nullable()).returns(z.void()),
  updatePanelContent: z.function().args(
    z.number(),
    z.object({
      id: z.string().optional(),
      status: PanelStatusSchema.optional(),
      prompt: z.string().optional(),
      imageUrl: z.string().optional(),
      imageBase64: z.string().optional(),
      error: z.string().optional(),
      panelNumber: z.number().optional(),
      layoutPosition: z.record(z.unknown()).optional(),
      imageData: z.string().optional(),
    }).partial()
  ).returns(z.void()),
  updateComicMetadata: z.function().args(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      genre: z.string().optional(),
      template: z.string().nullable().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      published: z.boolean().optional(),
    }).partial()
  ).returns(z.void()),
  addCharacter: z.function().returns(z.void()),
  removeCharacter: z.function().args(z.string()).returns(z.void()),
  updateCharacter: z.function().args(
    z.string(),
    z.enum(['name', 'description']),
    z.string()
  ).returns(z.void()),
  saveComic: z.function().returns(z.promise(ComicSchema.optional())),
  
  // Enhanced Phase 1 features
  hasChanges: z.boolean(),
  isAutoSaving: z.boolean(),
  lastAutoSave: z.date().nullable(),
  autoSaveFailureCount: z.number(),
  hasDraft: z.boolean(),
  loadDraft: z.function().returns(ComicSchema.nullable()),
  clearDraft: z.function().returns(z.void()),
  markAsSaved: z.function().returns(z.void()),
  triggerAutoSave: z.function().returns(z.promise(z.void())),
  isRetrying: z.boolean(),
  retryCount: z.number(),
  canRetry: z.boolean(),
  lastError: z.instanceof(Error).nullable(),
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
  panelNumber: z.number(),
  prompt: z.string().optional(),
  dialogue: z.string().optional(),
  layoutPosition: z.record(z.unknown()).optional(),
  image_url: z.string().url().optional(),
});

export const BackendPageDataSchema = z.object({
  page_id: z.string().uuid(),
  pageNumber: z.number(),
  panels: z.array(BackendPanelDataSchema),
});

export const FullComicDataFromBackendSchema = z.object({
  comic_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  genre: z.string().optional(),
  characters: z.unknown().optional(),
  setting: z.unknown().optional(),
  template: z.string().optional(),
  pages: z.array(BackendPageDataSchema),
  created_at: z.string(),
  updated_at: z.string(),
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