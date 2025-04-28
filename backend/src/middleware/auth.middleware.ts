// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from "aws-jwt-verify"; // Import the verifier
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model"; // Type for payload
import { AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from '../config'; // Import Cognito config
import pool from '../database'; // <<< Import the database pool

// --- Define an interface that extends Request ---
// It will now include the original Cognito payload AND our internal DB user ID
export interface AuthenticatedRequest extends Request {
    user?: CognitoAccessTokenPayload; // Keep original payload if needed downstream
    internalUserId?: string;          // Our internal DB UUID for the user
}

// --- Input Validation ---
if (!AWS_REGION || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
    throw new Error("Missing required Cognito configuration in environment variables.");
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
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    console.log("Cognito Auth Middleware: Checking for token...");

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        console.log("Cognito Auth Middleware: No token provided.");
        res.status(401).json({ error: 'Unauthorized: Access token is required.' });
        return;
    }

    let payload: CognitoAccessTokenPayload;
    try {
        console.log("Cognito Auth Middleware: Verifying token...");
        payload = await verifier.verify(token); // Verify the actual token

        // Attach original Cognito payload to req.user for potential downstream use
        req.user = payload;
        console.log(`Cognito Auth Middleware: Token verified for Cognito Sub: ${payload.sub}.`);

    } catch (error: any) {
        console.error("Cognito Auth Middleware: Token verification failed.", error);
        res.status(401).json({ error: `Unauthorized: ${error.message || 'Invalid token'}` });
        return;
    }

    // --- JIT Database User Sync Logic ---
    try {
        const cognitoSub = payload.sub;
        // Get username from token payload. This MUST be present in your Access Token claims.
        // const cognitoUsername = payload.username;
        // Email is often NOT in Access Token. It will likely be undefined here.
        // If your users table REQUIRES email (NOT NULL), you'll need to adjust:
        // 1) Verify ID token instead, OR 2) Make a Cognito GetUser API call, OR 3) Make email nullable in DB.
        const cognitoEmail = payload.email;
        const emailToInsert = cognitoEmail || null

        if (!cognitoSub) {
            console.error("Cognito Auth Middleware: Token payload missing 'sub'. Check Cognito token claims.", payload);
            // Return 500 because this is an unexpected server/config state
            res.status(500).json({ error: 'Internal Server Error: Incomplete token payload processing.' });
            return;
        }

        // 1. Check if user exists using auth_provider_id (Cognito Sub)
        const findUserQuery = 'SELECT user_id FROM users WHERE auth_provider_id = $1';
        const findUserResult = await pool.query(findUserQuery, [cognitoSub]);

        if (findUserResult.rows.length > 0) {
            // User exists, attach their internal DB user_id (UUID)
            req.internalUserId = findUserResult.rows[0].user_id;
            console.log(`Cognito Auth Middleware: Found existing DB user. Internal ID: ${req.internalUserId}`);

        } else {
            // User NOT found, create them
            console.log(`Cognito Auth Middleware: DB user not found for sub ${cognitoSub}. Creating entry...`);

            // Ensure email has a value or null based on DB constraints
            const emailToInsert = cognitoEmail || null; // Use null if email is nullable in DB
            // IMPORTANT: If email column has NOT NULL constraint, handle missing cognitoEmail appropriately!

            const insertUserQuery = `
                INSERT INTO users (username, email, auth_provider_id) 
                VALUES ($1, $2, $3)                
                ON CONFLICT (auth_provider_id) DO NOTHING 
                RETURNING user_id; 
            `;
            const insertUserResult = await pool.query(insertUserQuery, [null, emailToInsert, cognitoSub]);

            if (insertUserResult.rows.length > 0) {
                // Successfully inserted, get the new internal user_id (UUID)
                req.internalUserId = insertUserResult.rows[0].user_id;
                console.log(`Cognito Auth Middleware: Created new DB user. Internal ID: ${req.internalUserId}`);
            } else {
                // Insert didn't return rows, likely due to ON CONFLICT DO NOTHING (race condition)
                // Re-query to get the ID of the now-existing user
                console.warn(`Cognito Auth Middleware: Insert returned no ID for sub ${cognitoSub} (likely race condition), re-querying.`);
                const requeryResult = await pool.query(findUserQuery, [cognitoSub]);
                if (requeryResult.rows.length > 0) {
                    req.internalUserId = requeryResult.rows[0].user_id;
                    console.log(`Cognito Auth Middleware: Found DB user via re-query. Internal ID: ${req.internalUserId}`);
                } else {
                    // This should realistically never happen if INSERT or the requery works
                    throw new Error(`Failed to create or find user record in DB for sub ${cognitoSub} after insert attempt.`);
                }
            }
        }

        // Final check to ensure we have an internal ID before proceeding
        if (!req.internalUserId) {
            console.error(`Cognito Auth Middleware: CRITICAL - Failed to assign internalUserId for Cognito Sub ${cognitoSub}.`);
            res.status(500).json({ error: 'Internal Server Error: Could not synchronize user.' });
            return;
        }

        // User is authenticated AND synced with DB, proceed to the next handler
        next();

    } catch (dbError: any) {
        console.error("Cognito Auth Middleware: DATABASE error during user sync.", dbError);
        res.status(500).json({ error: 'Internal Server Error: Failed to process user authentication.' });
        // Do not call next() on DB error
    }
};