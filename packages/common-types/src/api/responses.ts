// API Response DTOs

import type { Comic, GeneratedImageData } from '../domain';

// Comic responses
export interface ComicResponse {
  comic_id: string;
  title: string;
  description?: string;
  genre?: string;
  characters?: Comic['characters'];
  setting?: Record<string, unknown>;
  template?: string;
  created_at: string;
  updated_at: string;
  pages?: ComicPageResponse[];
}

export interface ComicPageResponse {
  page_id: string;
  page_number: number;
  panels: ComicPanelResponse[];
}

export interface ComicPanelResponse {
  panel_id: string;
  panel_number: number;
  prompt?: string;
  dialogue?: string;
  layout_position?: Record<string, unknown>;
  image_url?: string;
}

export interface ComicsListResponse {
  comics: ComicListItemResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ComicListItemResponse {
  comic_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  panel_count: number;
  published: boolean;
}

// Image generation responses - using unified type
export type GeneratedImageDataResponse = GeneratedImageData;

// User responses
export interface UserResponse {
  user_id: string;
  username?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileResponse {
  profile_id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Authentication responses
export interface AuthResponse {
  user: UserResponse;
  profile?: UserProfileResponse;
  accessToken: string;
  refreshToken?: string;
}

// Error responses
export interface ErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  message?: string;
}

// Remove duplicate types - use the standard ComicResponse type above instead

// ComicListItem is already defined in domain/user.ts
