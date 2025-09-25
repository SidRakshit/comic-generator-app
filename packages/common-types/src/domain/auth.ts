// Domain types for Authentication

import type { AuthUser, FetchUserAttributesOutput } from "aws-amplify/auth";
import type { Request } from "express";

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

// Backend authentication types
export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email?: string;
    [key: string]: unknown;
  };
  internalUserId?: string;
}

// Cognito JWT payload type (simplified)
export interface CognitoAccessTokenPayload {
  sub: string;
  email?: string;
  [key: string]: unknown;
}
