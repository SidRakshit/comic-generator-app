// src/lib/amplify-config.ts
import { Amplify } from 'aws-amplify';

// Ensure these environment variables are available in your frontend environment
// (e.g., using .env.local and NEXT_PUBLIC_ prefix for Next.js)
const cognitoRegion = process.env.NEXT_PUBLIC_AWS_REGION;
const cognitoUserPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const cognitoUserPoolWebClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID; // Use the App Client ID

if (!cognitoRegion || !cognitoUserPoolId || !cognitoUserPoolWebClientId) {
    console.error("Missing required Cognito configuration environment variables for Amplify.");
    // Handle the error appropriately - maybe show a message or prevent app load
}

export const configureAmplify = () => {
    try {
        Amplify.configure({
            Auth: {
                Cognito: {
                    userPoolId: cognitoUserPoolId || '',
                    userPoolClientId: cognitoUserPoolWebClientId || '',
                    // region: cognitoRegion // Often inferred, but can be explicit
                }
            },
            // Add other Amplify categories config here if needed (API, Storage, etc.)
        });
        console.log("Amplify configured successfully.");
    } catch (error) {
        console.error("Error configuring Amplify:", error);
    }
};

