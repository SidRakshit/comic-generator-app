// API client types and utilities

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

// Generic API request function type
export type ApiRequestFunction = <T = unknown>(
  endpoint: string,
  method?: HttpMethod,
  body?: Record<string, unknown> | null
) => Promise<T>;

// API endpoints - Single Source of Truth for all API routes
export const API_ENDPOINTS = {
  // Comic endpoints
  COMICS: '/api/comics',
  COMIC_BY_ID: (id: string) => `/api/comics/${id}`,
  GENERATE_PANEL_IMAGE: '/api/comics/generate-panel-image',
  GENERATE_SCRIPT: '/api/comics/generate-script',
  
  // User endpoints
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_PROFILE: '/api/users/profile',
  
  // Auth endpoints
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  
  // Health check endpoints
  HEALTH: '/health',
  PING: '/ping',
} as const;

// Error handling types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request/Response interceptors
export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;
