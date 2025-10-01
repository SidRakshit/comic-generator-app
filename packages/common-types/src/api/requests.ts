// API Request DTOs

import type { ComicCharacter } from '../domain';

// Comic creation/update requests
export interface CreateComicRequest {
  title: string;
  description?: string;
  genre?: string;
  characters?: ComicCharacter[];
  setting?: Record<string, unknown>;
  template: string;
  pages: ComicPageRequest[];
}

export interface UpdateComicRequest {
  title?: string;
  description?: string;
  characters?: ComicCharacter[];
  setting?: Record<string, unknown>;
  pages?: ComicPageRequest[];
}

export interface ComicPageRequest {
  page_number: number;
  panels: ComicPanelRequest[];
}

export interface ComicPanelRequest {
  panel_number: number;
  prompt?: string;
  dialogue?: string;
  layout_position?: Record<string, unknown>;
  image_base64?: string; // For comic creation/update with generated images
}

// Image generation requests
export interface GenerateImageRequest {
  prompt: string;
}

// User profile requests
export interface UpdateUserProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
}

export interface DeleteAccountRequest {
  confirmation: string; // User must type "DELETE" to confirm
}

// Authentication requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

// Remove duplicate types - use the standard API types above instead
