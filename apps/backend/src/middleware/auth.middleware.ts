// backend/src/middleware/auth.middleware.ts

import { Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify"; // Import the verifier
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model"; // Type for payload
import { AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from "../config"; // Import Cognito config
import pool from "../database"; // <<< Import the database pool
import { AuthenticatedRequest } from "@repo/common-types"; // Import shared type

// --- Input Validation ---
if (!AWS_REGION || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
	throw new Error(
		"Missing required Cognito configuration in environment variables."
	);
}

// --- Create the Cognito JWT Verifier ---
// Ensure this verifies ACCESS tokens as currently configured
const verifier = CognitoJwtVerifier.create({
	userPoolId: COGNITO_USER_POOL_ID,
	tokenUse: "access", // Change to "id" ONLY if you need profile claims like email reliably AND verify the ID token instead
	clientId: COGNITO_CLIENT_ID,
});

/**
 * Express middleware to authenticate requests using AWS Cognito Access Tokens
 * AND ensure a corresponding user exists in the local database.
 */
export const authenticateToken = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	console.log("Cognito Auth Middleware: Checking for token...");

	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

	if (!token) {
		console.log("Cognito Auth Middleware: No token provided.");
		res.status(401).json({ error: "Unauthorized: Access token is required." });
		return;
	}

	let payload: CognitoAccessTokenPayload;
	try {
		console.log("Cognito Auth Middleware: Verifying token...");
		payload = await verifier.verify(token);

		req.user = payload;
		console.log(
			`Cognito Auth Middleware: Token verified for Cognito Sub: ${payload.sub}.`
		);
	} catch (error: any) {
		console.error("Cognito Auth Middleware: Token verification failed.", error);
		res
			.status(401)
			.json({ error: `Unauthorized: ${error.message || "Invalid token"}` });
		return;
	}

	// --- JIT Database User Sync Logic ---
	try {
		const cognitoSub = payload.sub;
		const cognitoEmail = payload.email;
		// const emailToInsert = cognitoEmail || null;

		if (!cognitoSub) {
			console.error(
				"Cognito Auth Middleware: Token payload missing 'sub'. Check Cognito token claims.",
				payload
			);
			res
				.status(500)
				.json({
					error: "Internal Server Error: Incomplete token payload processing.",
				});
			return;
		}

		const findUserQuery =
			"SELECT user_id FROM users WHERE auth_provider_id = $1";
		const findUserResult = await pool.query(findUserQuery, [cognitoSub]);

		if (findUserResult.rows.length > 0) {
			req.internalUserId = findUserResult.rows[0].user_id;
			console.log(
				`Cognito Auth Middleware: Found existing DB user. Internal ID: ${req.internalUserId}`
			);
		} else {
			console.log(
				`Cognito Auth Middleware: DB user not found for sub ${cognitoSub}. Creating entry...`
			);
			const emailToInsert = cognitoEmail || null;
			const insertUserQuery = `
                INSERT INTO users (username, email, auth_provider_id) 
                VALUES ($1, $2, $3)                
                ON CONFLICT (auth_provider_id) DO NOTHING 
                RETURNING user_id; 
            `;
			const insertUserResult = await pool.query(insertUserQuery, [
				null,
				emailToInsert,
				cognitoSub,
			]);

			if (insertUserResult.rows.length > 0) {
				req.internalUserId = insertUserResult.rows[0].user_id;
				console.log(
					`Cognito Auth Middleware: Created new DB user. Internal ID: ${req.internalUserId}`
				);
			} else {
				console.warn(
					`Cognito Auth Middleware: Insert returned no ID for sub ${cognitoSub} (likely race condition), re-querying.`
				);
				const requeryResult = await pool.query(findUserQuery, [cognitoSub]);
				if (requeryResult.rows.length > 0) {
					req.internalUserId = requeryResult.rows[0].user_id;
					console.log(
						`Cognito Auth Middleware: Found DB user via re-query. Internal ID: ${req.internalUserId}`
					);
				} else {
					throw new Error(
						`Failed to create or find user record in DB for sub ${cognitoSub} after insert attempt.`
					);
				}
			}
		}

		if (!req.internalUserId) {
			console.error(
				`Cognito Auth Middleware: CRITICAL - Failed to assign internalUserId for Cognito Sub ${cognitoSub}.`
			);
			res
				.status(500)
				.json({ error: "Internal Server Error: Could not synchronize user." });
			return;
		}

		next();
	} catch (dbError: any) {
		console.error(
			"Cognito Auth Middleware: DATABASE error during user sync.",
			dbError
		);
		res
			.status(500)
			.json({
				error: "Internal Server Error: Failed to process user authentication.",
			});
	}
};
