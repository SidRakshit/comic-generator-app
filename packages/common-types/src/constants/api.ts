// API and Server Configuration Constants - Single Source of Truth
// These constants ensure consistent configuration across frontend and backend

/**
 * Default port configurations
 */
export const DEFAULT_PORTS = {
	BACKEND: '8080',
	FRONTEND: '3000',
} as const;

/**
 * Default API endpoints and URLs
 */
export const API_CONFIG = {
	DEFAULT_BACKEND_URL: `http://localhost:${DEFAULT_PORTS.BACKEND}/api`,
	DEFAULT_FRONTEND_URLS: [
		`http://localhost:${DEFAULT_PORTS.FRONTEND}`,
		`http://127.0.0.1:${DEFAULT_PORTS.FRONTEND}`,
	],
	HEALTH_CHECK_PATH: '/health',
	PING_PATH: '/ping',
} as const;

/**
 * Server timeout configurations (in milliseconds)
 */
export const SERVER_TIMEOUTS = {
	REQUEST_TIMEOUT: 120000, // 2 minutes - for long image generation
	KEEP_ALIVE_TIMEOUT: 65000, // 65 seconds
	HEADERS_TIMEOUT: 66000, // 66 seconds - must be > keepAliveTimeout
	DATABASE_CONNECTION_TIMEOUT: 3000, // 3 seconds
	DATABASE_IDLE_TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Request size limits
 */
export const REQUEST_LIMITS = {
	JSON_BODY_LIMIT: '50mb', // For base64 image uploads
} as const;

/**
 * External service endpoints - Single Source of Truth
 */
export const EXTERNAL_APIS = {
	OPENAI: {
		CHAT_COMPLETIONS: 'https://api.openai.com/v1/chat/completions',
		IMAGE_GENERATIONS: 'https://api.openai.com/v1/images/generations',
	},
	AWS: {
		S3_URL_TEMPLATE: (bucketName: string, region: string, key: string) => 
			`https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
	},
} as const;

/**
 * AI generation configuration constants
 */
export const AI_CONFIG = {
	OPENAI: {
		MODELS: {
			CHAT: 'gpt-4o-mini',
			IMAGE: 'dall-e-3',
		},
		IMAGE: {
			SIZE: '1024x1024',
			QUALITY: 'standard',
			RESPONSE_FORMAT: 'b64_json',
			N: 1,
		},
		CHAT: {
			MAX_TOKENS: 300,
			TEMPERATURE: 0.8,
		},
		PROMPTS: {
			IMAGE_STYLE_SUFFIX: 'Style: vibrant, detailed comic book art, clear line work, professional quality.',
		},
	},
} as const;

/**
 * Environment variable names - Single Source of Truth
 */
export const ENV_VARS = {
	DATABASE_URL: 'DATABASE_URL',
	AWS_REGION: 'AWS_REGION',
	AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY_ID',
	AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_ACCESS_KEY',
	S3_BUCKET_NAME: 'S3_BUCKET_NAME',
	COGNITO_USER_POOL_ID: 'COGNITO_USER_POOL_ID',
	COGNITO_CLIENT_ID: 'COGNITO_CLIENT_ID',
	OPENAI_API_KEY: 'OPENAI_API_KEY',
	FRONTEND_URL: 'FRONTEND_URL',
	PORT: 'PORT',
	NODE_ENV: 'NODE_ENV',
	STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
	STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',
	ADMIN_SERVICE_TOKEN: 'ADMIN_SERVICE_TOKEN',
	ADMIN_SERVICE_USER_ID: 'ADMIN_SERVICE_USER_ID',
	ADMIN_SERVICE_TOKEN_HASH: 'ADMIN_SERVICE_TOKEN_HASH',
	ADMIN_IMPERSONATION_SECRET: 'ADMIN_IMPERSONATION_SECRET',
} as const;

/**
 * HTTP status codes - Single Source of Truth
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * File format and content type constants
 */
export const FILE_FORMATS = {
	PNG: '.png',
	JPEG: '.jpg',
	JPG: '.jpeg',
	WEBP: '.webp',
} as const;

export const CONTENT_TYPES = {
	PNG: 'image/png',
	JPEG: 'image/jpeg',
	JPG: 'image/jpeg',
	WEBP: 'image/webp',
	JSON: 'application/json',
} as const;

/**
 * AWS S3 configuration constants
 */
export const S3_CONFIG = {
	ACL: {
		PUBLIC_READ: 'public-read',
		PRIVATE: 'private',
	},
	STORAGE_CLASS: {
		STANDARD: 'STANDARD',
		REDUCED_REDUNDANCY: 'REDUCED_REDUNDANCY',
	},
} as const;

/**
 * UI layout and sizing constants
 */
export const UI_CONSTANTS = {
	ASPECT_RATIOS: {
		COMIC_COVER: 'aspect-[3/4]',
		SQUARE: 'aspect-square',
		WIDE: 'aspect-video',
	},
	Z_INDEX: {
		NAVBAR: 'z-50',
		MODAL: 'z-40',
		DROPDOWN: 'z-30',
		TOOLTIP: 'z-20',
	},
	BORDER_RADIUS: {
		SMALL: 'rounded',
		MEDIUM: 'rounded-md',
		LARGE: 'rounded-lg',
		FULL: 'rounded-full',
	},
} as const;
