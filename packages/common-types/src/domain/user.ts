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
// REMOVED: Duplicate type - use ComicListItemResponse from api/responses.ts instead
// This ensures consistent comic list data structure across frontend/backend

// Backend service types
export interface UserModel {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}
