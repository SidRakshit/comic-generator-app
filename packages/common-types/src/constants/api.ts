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
