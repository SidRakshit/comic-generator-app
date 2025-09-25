// API Request DTOs

import type { Comic, ComicCharacter } from '../domain';

// Comic creation/update requests
export interface CreateComicRequest {
  title: string;
  description?: string;
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

// Backend service request types (moved from comics.service.ts)
export interface PanelDataFromRequest {
  panelNumber: number;
  prompt: string;
  dialogue?: string;
  layoutPosition: object;
  imageBase64: string; // Expect base64 data from frontend
}

export interface PageDataFromRequest {
  pageNumber: number;
  panels: PanelDataFromRequest[];
}

export interface ComicDataFromRequest {
  title: string;
  description?: string;
  characters?: object[];
  setting?: object;
  pages: PageDataFromRequest[];
}
