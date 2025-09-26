// Request validation middleware using shared Zod schemas
// This ensures consistent validation across all API endpoints

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ErrorFactory } from '@repo/common-types';

/**
 * Generic validation middleware factory
 * Creates middleware that validates request body against a Zod schema
 */
export function validateRequestBody<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			// Validate and parse the request body
			const validatedData = schema.parse(req.body);
			
			// Replace req.body with validated data (ensures type safety)
			req.body = validatedData;
			
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				// Format Zod validation errors using shared error utilities
				const fieldErrors = error.errors.reduce((acc, err) => {
					const field = err.path.join('.');
					acc[field] = err.message;
					return acc;
				}, {} as Record<string, string>);

				const appError = ErrorFactory.validationFailed(
					'Request body validation failed',
					{ fields: fieldErrors }
				);
				
				res.status(appError.statusCode).json(appError.toResponse());
				return;
			}

			// Handle unexpected errors using shared utilities
			console.error('Unexpected validation error:', error);
			const appError = ErrorFactory.internalError('Validation processing failed');
			res.status(appError.statusCode).json(appError.toResponse());
		}
	};
}

/**
 * Validation middleware for query parameters
 */
export function validateRequestQuery<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const validatedQuery = schema.parse(req.query);
			req.query = validatedQuery as any;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors = error.errors.map(err => ({
					field: err.path.join('.'),
					message: err.message,
					code: err.code,
				}));

				res.status(400).json({
					error: 'Query validation failed',
					message: 'The query parameters do not meet the required format',
					details: formattedErrors,
				});
				return;
			}

			console.error('Unexpected query validation error:', error);
			res.status(500).json({
				error: 'Internal validation error',
				message: 'An unexpected error occurred during query validation',
			});
		}
	};
}

/**
 * Validation middleware for route parameters
 */
export function validateRequestParams<T>(schema: ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const validatedParams = schema.parse(req.params);
			req.params = validatedParams as any;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors = error.errors.map(err => ({
					field: err.path.join('.'),
					message: err.message,
					code: err.code,
				}));

				res.status(400).json({
					error: 'Parameter validation failed',
					message: 'The route parameters do not meet the required format',
					details: formattedErrors,
				});
				return;
			}

			console.error('Unexpected parameter validation error:', error);
			res.status(500).json({
				error: 'Internal validation error',
				message: 'An unexpected error occurred during parameter validation',
			});
		}
	};
}
