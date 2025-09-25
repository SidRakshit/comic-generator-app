// Zod schemas for Authentication validation

import { z } from 'zod';

export const AuthContextTypeSchema = z.object({
  user: z.any().nullable(), // AuthUser from aws-amplify
  userId: z.string().nullable(),
  attributes: z.any().nullable(), // UserAttributes from aws-amplify
  isLoading: z.boolean(),
  error: z.instanceof(Error).nullable(),
  getAccessToken: z.function().returns(z.promise(z.string().nullable())),
  handleSignOut: z.function().returns(z.promise(z.void())),
});

export const AuthenticatedRequestSchema = z.object({
  user: z.object({
    sub: z.string(),
    email: z.string().email().optional(),
  }).optional(),
  internalUserId: z.string().uuid().optional(),
});

export const CognitoAccessTokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
}).passthrough(); // Allow additional properties
