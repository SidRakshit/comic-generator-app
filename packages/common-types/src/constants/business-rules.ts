// Business rules and validation constants - Single Source of Truth
// These constants ensure consistent business logic across frontend and backend

/**
 * Password validation requirements
 */
export const PASSWORD_RULES = {
	MIN_LENGTH: 8,
	MAX_LENGTH: 128,
	REQUIRE_UPPERCASE: true,
	REQUIRE_LOWERCASE: true, 
	REQUIRE_NUMBERS: true,
	REQUIRE_SPECIAL_CHARS: false, // Keep false for user-friendliness
	
	// Helper text for UI
	REQUIREMENTS_TEXT: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
	STRENGTH_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
} as const;

/**
 * File upload constraints
 */
export const FILE_LIMITS = {
	// Image files
	IMAGE: {
		MAX_SIZE_MB: 10,
		MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
		ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
		MAX_DIMENSIONS: {
			WIDTH: 2048,
			HEIGHT: 2048,
		},
	},
	
	// General file uploads
	GENERAL: {
		MAX_SIZE_MB: 50,
		MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB - matches API_CONFIG.REQUEST_LIMITS.JSON_BODY
	},
} as const;

/**
 * Comic creation constraints
 */
export const COMIC_RULES = {
	// Content limits
	TITLE: {
		MIN_LENGTH: 1,
		MAX_LENGTH: 100,
	},
	
	DESCRIPTION: {
		MIN_LENGTH: 0,
		MAX_LENGTH: 1000,
	},
	
	GENRE: {
		MAX_LENGTH: 50,
	},
	
	// Panel constraints
	PANEL: {
		PROMPT: {
			MIN_LENGTH: 5,
			MAX_LENGTH: 750,
		},
		MAX_PANELS_PER_COMIC: 20, // Reasonable limit for performance
	},
	
	// Character constraints
	CHARACTER: {
		NAME: {
			MIN_LENGTH: 1,
			MAX_LENGTH: 50,
		},
		DESCRIPTION: {
			MIN_LENGTH: 0,
			MAX_LENGTH: 500,
		},
		MAX_CHARACTERS_PER_COMIC: 10, // Reasonable limit
	},
	
	// Page constraints
	PAGE: {
		MAX_PAGES_PER_COMIC: 50, // Reasonable limit for performance
		MIN_PANELS_PER_PAGE: 1,
		MAX_PANELS_PER_PAGE: 12, // Based on largest template
	},
} as const;

/**
 * User profile constraints
 */
export const USER_RULES = {
	USERNAME: {
		MIN_LENGTH: 3,
		MAX_LENGTH: 30,
		PATTERN: /^[a-zA-Z0-9_-]+$/, // Alphanumeric, underscore, hyphen only
		REQUIREMENTS_TEXT: 'Username must be 3-30 characters, letters, numbers, underscore, or hyphen only',
	},
	
	EMAIL: {
		MAX_LENGTH: 254, // RFC 5321 standard
		PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
	},
	
	BIO: {
		MAX_LENGTH: 300,
	},
	
	PROFILE: {
		MAX_COMICS_DISPLAYED: 20, // Pagination limit
		MAX_FAVORITES_DISPLAYED: 20,
	},
} as const;

/**
 * API rate limiting and performance constraints
 */
export const PERFORMANCE_LIMITS = {
	// Request limits
	API: {
		MAX_REQUESTS_PER_MINUTE: 60,
		MAX_REQUESTS_PER_HOUR: 1000,
	},
	
	// AI generation limits
	AI_GENERATION: {
		MAX_CONCURRENT_REQUESTS: 3, // Prevent overwhelming OpenAI API
		TIMEOUT_SECONDS: 120, // 2 minutes for image generation
		RETRY_ATTEMPTS: 2,
		RETRY_DELAY_MS: 1000,
	},
	
	// Database query limits
	DATABASE: {
		MAX_RESULTS_PER_PAGE: 50,
		DEFAULT_PAGE_SIZE: 20,
		MAX_SEARCH_RESULTS: 100,
	},
} as const;

/**
 * Content moderation rules
 */
export const MODERATION_RULES = {
	// Prohibited content patterns (basic)
	PROHIBITED_WORDS: [
		// Add specific prohibited words as needed
		// Keep this list minimal and focus on clearly harmful content
	] as const,
	
	// Content flags
	FLAGS: {
		EXPLICIT_CONTENT: 'explicit_content',
		SPAM: 'spam', 
		HARASSMENT: 'harassment',
		COPYRIGHT: 'copyright',
		OTHER: 'other',
	} as const,
	
	// Auto-moderation thresholds
	THRESHOLDS: {
		MIN_REPORT_COUNT: 3, // Reports needed for review
		AUTO_HIDE_SCORE: 10, // Auto-hide content with this score
	},
} as const;

/**
 * Search and discovery rules
 */
export const SEARCH_RULES = {
	QUERY: {
		MIN_LENGTH: 2,
		MAX_LENGTH: 100,
	},
	
	RESULTS: {
		DEFAULT_LIMIT: 20,
		MAX_LIMIT: 50,
	},
	
	FILTERS: {
		SORT_OPTIONS: ['newest', 'oldest', 'popular', 'trending'] as const,
	},
} as const;

/**
 * Notification and communication rules
 */
export const NOTIFICATION_RULES = {
	// Message limits
	MESSAGE: {
		MAX_LENGTH: 1000,
		MAX_MESSAGES_PER_DAY: 50,
	},
	
	// Notification types
	TYPES: {
		COMIC_LIKED: 'comic_liked',
		COMIC_SHARED: 'comic_shared', 
		NEW_FOLLOWER: 'new_follower',
		SYSTEM_UPDATE: 'system_update',
	} as const,
	
	// Delivery preferences
	DELIVERY: {
		EMAIL_BATCH_SIZE: 100,
		MAX_DAILY_EMAILS: 5,
	},
} as const;

/**
 * Session and security rules
 */
export const SECURITY_RULES = {
	SESSION: {
		MAX_DURATION_HOURS: 24 * 7, // 7 days
		IDLE_TIMEOUT_MINUTES: 60,   // 1 hour idle
		REFRESH_TOKEN_DURATION_DAYS: 30,
	},
	
	LOGIN: {
		MAX_ATTEMPTS: 5,
		LOCKOUT_DURATION_MINUTES: 15,
		REQUIRE_2FA_THRESHOLD: 3, // Failed attempts before suggesting 2FA
	},
	
	API_KEYS: {
		MAX_KEYS_PER_USER: 5,
		DEFAULT_EXPIRY_DAYS: 90,
	},
} as const;
