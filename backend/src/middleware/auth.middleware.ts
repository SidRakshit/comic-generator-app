// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from "aws-jwt-verify"; // Import the verifier
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model"; // Type for payload
import { AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from '../config'; // Import Cognito config

// Define an interface that extends Request to include user info from Cognito token
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string; // Cognito 'sub' (Subject) claim
        username?: string; // Cognito 'username' claim (different from sub)
        email?: string; // Cognito 'email' claim
        // Add other claims if needed
    };
}

// --- Input Validation ---
if (!AWS_REGION || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
    throw new Error("Missing required Cognito configuration in environment variables.");
}

// --- Create the Cognito JWT Verifier ---
// This configuration assumes you are verifying ACCESS tokens.
// For ID tokens, change tokenUse: 'id'.
const verifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USER_POOL_ID,
    tokenUse: "access", // Or "id" if you intend to verify ID tokens instead
    clientId: COGNITO_CLIENT_ID,
    // Optional: Add scope validation if needed: scope: "read",
    // Optional: Add custom checks: customJwtCheck: ({ header, payload, signature }) => { /* ... */ },
});

/**
 * Express middleware to authenticate requests using AWS Cognito Access Tokens.
 * Verifies the token from the Authorization header using aws-jwt-verify.
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

    try {
        console.log("Cognito Auth Middleware: Verifying token...");
        // Verify the token using the pre-configured verifier
        const payload: CognitoAccessTokenPayload = await verifier.verify(token);

        console.log("Cognito Auth Middleware: Token verified successfully. Payload:", payload);

        // --- Attach user info ---
        // IMPORTANT: Use 'sub' (Subject) from the payload as the unique, stable user ID
        req.user = {
            id: payload.sub,
            username: payload.username, // This is the Cognito username, might differ from sub
            // Add other relevant claims if needed (check payload structure)
            // email: payload.email // Email might only be in the ID token, not Access token by default
        };
        console.log(`Cognito Auth Middleware: User ${req.user.id} attached to request.`);

        next(); // Proceed to the next handler (controller)

    } catch (error: any) {
        console.error("Cognito Auth Middleware: Token verification failed.", error);
        // aws-jwt-verify throws specific errors (e.g., JwtExpiredError, TokenUseMismatchError)
        // You can catch specific error types if needed for more granular responses
        res.status(401).json({ error: `Unauthorized: ${error.message || 'Invalid token'}` });
    }
};
