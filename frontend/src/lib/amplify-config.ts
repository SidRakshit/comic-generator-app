// src/lib/amplify-config.ts
import { Amplify } from 'aws-amplify';

let isConfigured = false; // Flag to prevent multiple configurations

// Log availability at module load time (might be undefined server-side/build)
console.log("[Amplify Config Module Load] NEXT_PUBLIC_AWS_REGION:", process.env.NEXT_PUBLIC_AWS_REGION);

export const configureAmplify = () => {
    // Prevent re-configuration
    if (isConfigured) {
        return;
    }
    console.log("[configureAmplify Called]"); // Log when function is called

    // --- Read environment variables INSIDE the function ---
    const cognitoRegion = process.env.NEXT_PUBLIC_AWS_REGION;
    const cognitoUserPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    const cognitoUserPoolWebClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const cognitoIdentityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;

    // Log values *inside* the function call
    console.log("[configureAmplify] Read Region:", cognitoRegion);
    console.log("[configureAmplify] Read Pool ID:", cognitoUserPoolId);
    console.log("[configureAmplify] Read Client ID:", cognitoUserPoolWebClientId);

    // --- Perform the check INSIDE the function ---
    if (!cognitoRegion || !cognitoUserPoolId || !cognitoUserPoolWebClientId) {
        console.error("Amplify config ERROR: Missing required Cognito variables at the time of configuration. Check .env.local and prefixes.");
        return; // Stop configuration if essential variables are missing
    }

    try {
        const config: any = {
            Auth: {
                Cognito: {
                    userPoolId: cognitoUserPoolId,
                    userPoolClientId: cognitoUserPoolWebClientId,
                }
            },
        };

        if (cognitoIdentityPoolId) {
            config.Auth.Cognito.identityPoolId = cognitoIdentityPoolId;
        }

        Amplify.configure(config);
        isConfigured = true;
        console.log("Amplify configured successfully.");

    } catch (error) {
        console.error("Error configuring Amplify:", error);
    }
};
