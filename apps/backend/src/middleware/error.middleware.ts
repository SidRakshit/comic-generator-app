// Global error handling middleware using shared error utilities
// Provides consistent error responses across all API endpoints

import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError, toStandardError, ErrorFactory } from '@repo/common-types';

/**
 * Global error handling middleware
 * Should be placed after all routes and other middleware
 */
export function errorHandler(
	error: unknown,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	// Log error for debugging (in production, use proper logging service)
	const isProd = process.env.NODE_ENV === 'production';
	
	if (!isProd) {
		console.error('Error caught by global handler:', error);
		if (error instanceof Error) {
			console.error('Stack trace:', error.stack);
		}
	}

	// Convert to standard error format
	const standardError = toStandardError(error);
	
	// Determine status code
	let statusCode = 500;
	if (isAppError(error)) {
		statusCode = error.statusCode;
	} else if (error instanceof Error) {
		// Handle common error types
		if (error.message.includes('Cast to ObjectId failed')) {
			statusCode = 400; // Invalid ID format
		} else if (error.message.includes('duplicate key')) {
			statusCode = 409; // Conflict
		} else if (error.message.includes('validation failed')) {
			statusCode = 400; // Validation error
		}
	}

	// Send error response
	res.status(statusCode).json(standardError);
}

/**
 * Async error wrapper for route handlers
 * Automatically catches async errors and passes them to error middleware
 */
export function asyncHandler<T extends Request, U extends Response>(
	fn: (req: T, res: U, next: NextFunction) => Promise<void>
) {
	return (req: T, res: U, next: NextFunction): void => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * 404 handler middleware
 * Should be placed after all routes but before error handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
	const error = ErrorFactory.notFound('Endpoint', req.originalUrl);
	next(error);
}

/**
 * Validation error handler
 * Specifically for handling Zod validation errors with detailed formatting
 */
export function handleValidationError(error: unknown): AppError {
	if (error && typeof error === 'object' && 'errors' in error) {
		const zodError = error as { errors: Array<{ path: string[]; message: string; code: string }> };
		
		const details = zodError.errors.reduce((acc, err) => {
			const field = err.path.join('.');
			acc[field] = err.message;
			return acc;
		}, {} as Record<string, string>);

		return ErrorFactory.validationFailed('Request validation failed', { fields: details });
	}

	return ErrorFactory.internalError('Validation error processing failed');
}
