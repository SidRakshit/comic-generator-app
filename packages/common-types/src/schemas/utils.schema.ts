// Zod schemas for Utility types validation

import { z } from 'zod';

// HTTP Method schema
export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

// API Request Config schema
export const ApiRequestConfigSchema = z.object({
  method: HttpMethodSchema,
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
});

// API Client Config schema
export const ApiClientConfigSchema = z.object({
  baseUrl: z.string().url('Base URL must be a valid URL'),
  defaultHeaders: z.record(z.string()).optional(),
  timeout: z.number().positive('Timeout must be positive').optional(),
});

// API Error schema
export const ApiErrorSchema = z.object({
  name: z.literal('ApiError'),
  message: z.string(),
  status: z.number(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

// Request/Response interceptor function schemas
export const RequestInterceptorSchema = z.function()
  .args(z.object({
    method: HttpMethodSchema,
    headers: z.record(z.string()).optional(),
    body: z.unknown().optional(),
  }))
  .returns(z.promise(z.object({
    method: HttpMethodSchema,
    headers: z.record(z.string()).optional(),
    body: z.unknown().optional(),
  })));

export const ResponseInterceptorSchema = z.function()
  .args(z.any()) // Response object
  .returns(z.promise(z.any())); // Response object

export const ErrorInterceptorSchema = z.function()
  .args(ApiErrorSchema)
  .returns(z.promise(ApiErrorSchema));
