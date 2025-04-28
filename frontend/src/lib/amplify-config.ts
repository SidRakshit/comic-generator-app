// src/lib/amplify-config.ts
import { Amplify, ResourcesConfig } from 'aws-amplify';
let isConfigured = false;
console.log("[Amplify Config Module Load] NEXT_PUBLIC_AWS_REGION:", process.env.NEXT_PUBLIC_AWS_REGION);


export const configureAmplify = () => {
    // Prevent re-configuration
    if (isConfigured) {
        return;
    }
    console.log("[configureAmplify Called]");

    // --- Read environment variables INSIDE the function ---
    const cognitoRegion = process.env.NEXT_PUBLIC_AWS_REGION;
    const cognitoUserPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    const cognitoUserPoolWebClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const cognitoIdentityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;

    // Log values *inside* the function call
    console.log("[configureAmplify] Read Region:", cognitoRegion);
    console.log("[configureAmplify] Read Pool ID:", cognitoUserPoolId);
    console.log("[configureAmplify] Read Client ID:", cognitoUserPoolWebClientId);
    console.log("[configureAmplify] Read Identity Pool ID:", cognitoIdentityPoolId);


    // --- Perform the check INSIDE the function ---
    if (!cognitoRegion || !cognitoUserPoolId || !cognitoUserPoolWebClientId) {
        console.error("Amplify config ERROR: Missing required Cognito variables at the time of configuration. Check .env.local and prefixes.");
        return;
    }

    try {
        const amplifyConfig: ResourcesConfig = {
            Auth: {
                Cognito: {
                    userPoolId: cognitoUserPoolId,
                    userPoolClientId: cognitoUserPoolWebClientId,
                }
            }
        };
        if (cognitoIdentityPoolId && cognitoIdentityPoolId.trim() !== '' && amplifyConfig.Auth?.Cognito) {
            amplifyConfig.Auth.Cognito.identityPoolId = cognitoIdentityPoolId;
        }
        Amplify.configure(amplifyConfig);
        isConfigured = true;
        console.log("Amplify configured successfully with:", amplifyConfig);

    } catch (error) {
        console.error("Error configuring Amplify:", error);
    }
};
