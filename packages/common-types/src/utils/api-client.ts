// API client types and utilities
import { API_ROUTES, API_BASE_PATH } from '../constants/routes';
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

const API_PREFIX = API_BASE_PATH;
const withApiPrefix = (path: string): string => `${API_PREFIX}${path}`;

// API endpoints - Single Source of Truth for all API routes
export const API_ENDPOINTS = {
  ROOT: withApiPrefix(API_ROUTES.ROOT),

  // Comic endpoints
  COMICS: withApiPrefix(API_ROUTES.COMICS.BASE),
  COMIC_BY_ID: (id: string) => withApiPrefix(API_ROUTES.COMICS.BY_ID(id)),
  GENERATE_PANEL_IMAGE: withApiPrefix(API_ROUTES.COMICS.GENERATE_PANEL_IMAGE),
  GENERATE_SCRIPT: withApiPrefix(API_ROUTES.COMICS.GENERATE_SCRIPT),
  
  // User endpoints
  USERS: withApiPrefix(API_ROUTES.USERS.BASE),
  USER_BY_ID: (id: string) => withApiPrefix(API_ROUTES.USERS.BY_ID(id)),
  USER_PROFILE: withApiPrefix(API_ROUTES.USERS.PROFILE),
  USER_CREDITS_ME: withApiPrefix(API_ROUTES.USERS.ME_CREDITS),
  USER_DELETE_ACCOUNT: withApiPrefix(API_ROUTES.USERS.DELETE_ACCOUNT),
  
  // Favorites
  FAVORITES: withApiPrefix(API_ROUTES.FAVORITES.BASE),
  FAVORITE_BY_ID: (id: string) => withApiPrefix(API_ROUTES.FAVORITES.BY_ID(id)),

  // Utility
  PLACEHOLDER_IMAGE: withApiPrefix(API_ROUTES.UTILITY.PLACEHOLDER),
  PLACEHOLDER_IMAGE_WITH_SIZE: (
    width: string | number,
    height?: string | number,
    extraPath = ''
  ) => withApiPrefix(API_ROUTES.UTILITY.PLACEHOLDER_WITH_SIZE(width, height, extraPath)),
  
  // Auth endpoints
  LOGIN: withApiPrefix(API_ROUTES.AUTH.LOGIN),
  LOGOUT: withApiPrefix(API_ROUTES.AUTH.LOGOUT),
  REFRESH: withApiPrefix(API_ROUTES.AUTH.REFRESH),

  // Billing
  BILLING_CHECKOUT: withApiPrefix(API_ROUTES.BILLING.CHECKOUT),
  BILLING_REFUND: withApiPrefix(API_ROUTES.ADMIN.BILLING.REFUND),
  ADMIN_BILLING_EXPORT: withApiPrefix(API_ROUTES.ADMIN.BILLING.EXPORT),
  ADMIN_PURCHASE_HISTORY: withApiPrefix(API_ROUTES.ADMIN.BILLING.PURCHASES),

  // Admin
  ADMIN_DASHBOARD: withApiPrefix(API_ROUTES.ADMIN.DASHBOARD),
  ADMIN_USERS: withApiPrefix(API_ROUTES.ADMIN.USERS.BASE),
  ADMIN_USER_BY_ID: (userId: string) => withApiPrefix(API_ROUTES.ADMIN.USERS.BY_ID(userId)),
  ADMIN_USER_CREDITS: (userId: string) => withApiPrefix(API_ROUTES.ADMIN.USERS.CREDITS(userId)),
  ADMIN_IMPERSONATE: (userId: string) => withApiPrefix(API_ROUTES.ADMIN.USERS.IMPERSONATE(userId)),
  ADMIN_AUDIT_LOGS: withApiPrefix(API_ROUTES.ADMIN.AUDIT_LOGS),
  ADMIN_ANALYTICS_OVERVIEW: withApiPrefix(API_ROUTES.ADMIN.ANALYTICS_OVERVIEW),
  ADMIN_MFA_SETUP: withApiPrefix(API_ROUTES.ADMIN.SECURITY.MFA_SETUP),
  ADMIN_MFA_VERIFY: withApiPrefix(API_ROUTES.ADMIN.SECURITY.MFA_VERIFY),
  ADMIN_MFA_DISABLE: withApiPrefix(API_ROUTES.ADMIN.SECURITY.MFA_DISABLE),

  // Impersonation
  ADMIN_IMPERSONATION_EXCHANGE: withApiPrefix(API_ROUTES.IMPERSONATION.EXCHANGE),
  IMPERSONATION_EXCHANGE: withApiPrefix(API_ROUTES.IMPERSONATION.EXCHANGE),

  // Favorites & billing extras
  WEBHOOKS_STRIPE: withApiPrefix(API_ROUTES.WEBHOOKS.STRIPE),

  // Health check endpoints
  HEALTH: API_ROUTES.HEALTH,
  PING: API_ROUTES.PING,
  METRICS: API_ROUTES.METRICS,
  TEST_CORS: API_ROUTES.TEST_CORS,
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
