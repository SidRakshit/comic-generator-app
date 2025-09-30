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
	// Comic management
	COMICS: {
		BASE: '/comics',
		BY_ID: (id: string) => `/comics/${id}`,
		GENERATE_PANEL_IMAGE: '/comics/generate-panel-image',
		GENERATE_SCRIPT: '/comics/generate-script',
	},
	
	// User management  
	USERS: {
		BASE: '/users',
		BY_ID: (id: string) => `/users/${id}`,
		PROFILE: '/users/profile',
	},
	
	// Authentication
	AUTH: {
		LOGIN: '/auth/login',
		LOGOUT: '/auth/logout', 
		REFRESH: '/auth/refresh',
	},
	
	// System
	HEALTH: '/health',
	PING: '/ping',
} as const;

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
