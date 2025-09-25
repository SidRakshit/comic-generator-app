// Domain types for User-related entities

export interface User {
  user_id: string;
  username?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  auth_provider_id: string;
}

export interface UserProfile {
  profile_id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Frontend-specific user types
export interface ComicListItem {
  comic_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  panel_count: number;
  published: boolean;
}

// Backend service types
export interface UserModel {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}
