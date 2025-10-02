// Shared error handling utilities - Single Source of Truth
// Provides consistent error types and handling across frontend and backend

/**
 * Standard error codes used across the application
 * These are exported for use by other packages and applications
 */
export enum ErrorCode {
	// Authentication & Authorization
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	
	// Validation
	VALIDATION_FAILED = 'VALIDATION_FAILED',
	INVALID_INPUT = 'INVALID_INPUT',
	MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
	
	// Resources
	NOT_FOUND = 'NOT_FOUND',
	ALREADY_EXISTS = 'ALREADY_EXISTS',
	RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
	
	// External Services
	OPENAI_ERROR = 'OPENAI_ERROR',
	S3_ERROR = 'S3_ERROR',
	DATABASE_ERROR = 'DATABASE_ERROR',
	
	// General
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	RATE_LIMITED = 'RATE_LIMITED',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
	PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
}

/**
 * Standard error response structure
 */
export interface StandardError {
	error: string;
	message: string;
	code?: ErrorCode;
	details?: Record<string, unknown>;
	timestamp?: string;
}

/**
 * Application-specific error class
 */
export class AppError extends Error {
	public readonly code: ErrorCode;
	public readonly statusCode: number;
	public readonly details?: Record<string, unknown>;
	public readonly timestamp: string;

	constructor(
		message: string,
		code: ErrorCode,
		statusCode: number = 500,
		details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
		this.timestamp = new Date().toISOString();

		// Ensure proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, AppError.prototype);
	}

	/**
	 * Convert to standard error response format
	 */
	toResponse(): StandardError {
		return {
			error: this.name,
			message: this.message,
			code: this.code,
			details: this.details,
			timestamp: this.timestamp,
		};
	}
}

/**
 * Pre-defined error factory functions for common scenarios
 */
export const ErrorFactory = {
	// Authentication errors
	unauthorized(message = 'Authentication required'): AppError {
		return new AppError(message, ErrorCode.UNAUTHORIZED, 401);
	},

	forbidden(message = 'Access denied'): AppError {
		return new AppError(message, ErrorCode.FORBIDDEN, 403);
	},

	tokenExpired(message = 'Authentication token has expired'): AppError {
		return new AppError(message, ErrorCode.TOKEN_EXPIRED, 401);
	},

	// Validation errors
	validationFailed(message = 'Request validation failed', details?: Record<string, unknown>): AppError {
		return new AppError(message, ErrorCode.VALIDATION_FAILED, 400, details);
	},

	invalidInput(message = 'Invalid input provided', field?: string): AppError {
		return new AppError(
			message,
			ErrorCode.INVALID_INPUT,
			400,
			field ? { field } : undefined
		);
	},

	// Resource errors
	notFound(resource = 'Resource', id?: string): AppError {
		return new AppError(
			`${resource} not found`,
			ErrorCode.NOT_FOUND,
			404,
			id ? { id } : undefined
		);
	},

	alreadyExists(resource = 'Resource', id?: string): AppError {
		return new AppError(
			`${resource} already exists`,
			ErrorCode.ALREADY_EXISTS,
			409,
			id ? { id } : undefined
		);
	},

	// External service errors
	openAiError(message = 'OpenAI service error', details?: Record<string, unknown>): AppError {
		return new AppError(message, ErrorCode.OPENAI_ERROR, 502, details);
	},

	s3Error(message = 'S3 storage error', details?: Record<string, unknown>): AppError {
		return new AppError(message, ErrorCode.S3_ERROR, 502, details);
	},

	databaseError(message = 'Database operation failed', details?: Record<string, unknown>): AppError {
		return new AppError(message, ErrorCode.DATABASE_ERROR, 500, details);
	},

	// General errors
	internalError(message = 'Internal server error', details?: Record<string, unknown>): AppError {
		return new AppError(message, ErrorCode.INTERNAL_ERROR, 500, details);
	},

	paymentRequired(message = 'Payment required'): AppError {
		return new AppError(message, ErrorCode.PAYMENT_REQUIRED, 402);
	},
};

/**
 * Utility to check if an error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}

/**
 * Convert any error to a standard error response
 */
export function toStandardError(error: unknown): StandardError {
	if (isAppError(error)) {
		return error.toResponse();
	}

	if (error instanceof Error) {
		return {
			error: 'Error',
			message: error.message,
			code: ErrorCode.INTERNAL_ERROR,
			timestamp: new Date().toISOString(),
		};
	}

	return {
		error: 'Unknown Error',
		message: 'An unknown error occurred',
		code: ErrorCode.INTERNAL_ERROR,
		timestamp: new Date().toISOString(),
	};
}