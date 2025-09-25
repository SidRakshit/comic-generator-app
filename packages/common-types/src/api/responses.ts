// API Response DTOs

import type { Comic, User, UserProfile, BackendComicData, BackendPageData, BackendPanelData, GeneratedImageData } from '../domain';

// Comic responses
export interface ComicResponse {
  comic_id: string;
  title: string;
  description?: string;
  characters?: Comic['characters'];
  setting?: Record<string, unknown>;
  template?: string;
  created_at: string;
  updated_at: string;
  pages?: BackendPageData[];
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

// Backend service response types (moved from comics.service.ts)
export interface FullPageData {
  page_id: string;
  pageNumber: number;
  panels: FullPanelData[];
}

export interface FullPanelData {
  panel_id: string;
  panelNumber: number;
  prompt?: string;
  dialogue?: string;
  layoutPosition?: object;
  image_url: string; // Final S3 URL
}

export interface FullComicData {
  comic_id: string;
  title: string;
  description?: string;
  characters?: object[];
  setting?: object;
  created_at: Date;
  updated_at: Date;
  pages: FullPageData[];
}

// ComicListItem is already defined in domain/user.ts