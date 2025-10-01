// Application routes - Single Source of Truth for all navigation paths
// These constants ensure consistent routing across the frontend

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	SIGNUP: '/signup',
	CONFIRM_SIGNUP: '/confirm-signup',
} as const;

/**
 * Protected routes - require authentication
 */
export const PROTECTED_ROUTES = {
	PROFILE: '/profile',
	COMICS: '/comics',
	COMICS_CREATE: '/comics/create',
	COMICS_EDITOR: '/comics/editor',
	COMIC_BY_ID: (id: string) => `/comics/${id}`,
} as const;

/**
 * API routes - backend endpoints (without /api prefix)
 */
export const API_ROUTES = {
	ROOT: '/',

	// Comic management
	COMICS: {
		BASE: '/comics',
		BY_ID: (id: string | number) => `/comics/${id}`,
		GENERATE_PANEL_IMAGE: '/comics/generate-panel-image',
		GENERATE_SCRIPT: '/comics/generate-script',
	},
	
	// User management  
	USERS: {
		BASE: '/users',
		BY_ID: (id: string | number) => `/users/${id}`,
		PROFILE: '/users/profile',
		ME_CREDITS: '/users/me/credits',
		DELETE_ACCOUNT: '/users/me/delete',
	},

	// Favorites
	FAVORITES: {
		BASE: '/favorites',
		BY_ID: (id: string | number) => `/favorites/${id}`,
	},

	// Billing (customer-facing)
	BILLING: {
		BASE: '/billing',
		CHECKOUT: '/billing/checkout',
	},

	// Administration
	ADMIN: {
		BASE: '/admin',
		DASHBOARD: '/admin/dashboard',
		USERS: {
			BASE: '/admin/users',
			BY_ID: (id: string | number) => `/admin/users/${id}`,
			IMPERSONATE: (id: string | number) => `/admin/users/${id}/impersonate`,
			CREDITS: (id: string | number) => `/admin/users/${id}/credits`,
		},
		BILLING: {
			PURCHASES: '/admin/billing/purchases',
			EXPORT: '/admin/billing/purchases/export',
			REFUND: '/admin/billing/refund',
		},
		AUDIT_LOGS: '/admin/audit-logs',
		ANALYTICS_OVERVIEW: '/admin/analytics/overview',
		SECURITY: {
			MFA_SETUP: '/admin/security/mfa/setup',
			MFA_VERIFY: '/admin/security/mfa/verify',
			MFA_DISABLE: '/admin/security/mfa',
		},
	},

	// Impersonation
	IMPERSONATION: {
		BASE: '/impersonation',
		EXCHANGE: '/impersonation/exchange',
	},

	// Webhooks
	WEBHOOKS: {
		BASE: '/webhooks',
		STRIPE: '/webhooks/stripe',
	},

	// Utility endpoints
	UTILITY: {
		PLACEHOLDER: '/placeholder',
		PLACEHOLDER_WITH_SIZE: (
			width: string | number,
			height?: string | number,
			extraPath = ''
		) => `/placeholder/${width}${height !== undefined ? `/${height}` : ''}${extraPath}`,
	},

	// Authentication
	AUTH: {
		LOGIN: '/auth/login',
		LOGOUT: '/auth/logout', 
		REFRESH: '/auth/refresh',
	},

	// System-level (non /api) routes
	HEALTH: '/health',
	PING: '/ping',
	METRICS: '/metrics',
	TEST_CORS: '/test-cors',
} as const;

export const API_BASE_PATH = '/api' as const;

/**
 * Navigation paths for UI components
 */
export const NAV_PATHS = {
	// Main navigation
	HOME: PUBLIC_ROUTES.HOME,
	COMICS: PROTECTED_ROUTES.COMICS,
	CREATE: PROTECTED_ROUTES.COMICS_CREATE,
	PROFILE: PROTECTED_ROUTES.PROFILE,
	
	// Auth navigation
	LOGIN: PUBLIC_ROUTES.LOGIN,
	SIGNUP: PUBLIC_ROUTES.SIGNUP,
	LOGOUT: '/logout', // Handled by auth system
} as const;

/**
 * External URLs and links
 */
export const EXTERNAL_LINKS = {
	GITHUB: 'https://github.com',
	SUPPORT: 'mailto:support@example.com',
	PRIVACY: '/privacy',
	TERMS: '/terms',
} as const;

/**
 * Route helpers and utilities
 */
type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];

export const ROUTE_HELPERS = {
	/**
	 * Check if a route requires authentication
	 */
	isProtectedRoute: (path: string): boolean => {
		return Object.values(PROTECTED_ROUTES).some(route => 
			typeof route === 'string' ? path.startsWith(route) : false
		) || path.startsWith('/comics/');
	},
	
	/**
	 * Check if a route is public
	 */
	isPublicRoute: (path: string): boolean => {
		return Object.values(PUBLIC_ROUTES).includes(path as PublicRoute);
	},
	
	/**
	 * Get the login redirect URL with return path
	 */
	getLoginRedirect: (returnPath?: string): string => {
		const loginUrl = PUBLIC_ROUTES.LOGIN;
		return returnPath ? `${loginUrl}?redirect=${encodeURIComponent(returnPath)}` : loginUrl;
	},
	
	/**
	 * Get the default redirect after login
	 */
	getDefaultRedirect: (): string => {
		return PROTECTED_ROUTES.COMICS;
	},
} as const;
