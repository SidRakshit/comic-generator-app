// Domain types for Authentication

import type { AuthUser, FetchUserAttributesOutput } from "aws-amplify/auth";
import type { AdminRole, AdminPermission } from "./admin";

export type UserAttributes = FetchUserAttributesOutput;

export interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  attributes: UserAttributes | null;
  isLoading: boolean;
  error: Error | null;
  getAccessToken: () => Promise<string | null>;
  handleSignOut: () => Promise<void>;
}

// Generic request interface for backend authentication
// This will be intersected with Express Request in the backend
export interface AuthenticatedRequestFields {
  user?: {
    sub: string;
    email?: string;
    [key: string]: unknown;
  };
  internalUserId?: string;
  isAdmin?: boolean;
  adminRoles?: AdminRole[];
  adminPermissions?: AdminPermission[];
}

// Type alias for backend - to be used with Express Request
// Usage: AuthenticatedRequest = Request & AuthenticatedRequestFields
export type AuthenticatedRequest<T = any> = T & AuthenticatedRequestFields;

// Cognito JWT payload type (simplified)
export interface CognitoAccessTokenPayload {
  sub: string;
  email?: string;
  [key: string]: unknown;
}
