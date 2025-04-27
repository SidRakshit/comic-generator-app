// src/lib/amplify-config.ts
import { Amplify, ResourcesConfig } from 'aws-amplify'; // Import ResourcesConfig type
// Removed specific Cognito type imports as they caused issues

let isConfigured = false; // Flag to prevent multiple configurations

// Log availability at module load time (might be undefined server-side/build)
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
    const cognitoIdentityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID; // Optional

    // Log values *inside* the function call
    console.log("[configureAmplify] Read Region:", cognitoRegion);
    console.log("[configureAmplify] Read Pool ID:", cognitoUserPoolId);
    console.log("[configureAmplify] Read Client ID:", cognitoUserPoolWebClientId);
    console.log("[configureAmplify] Read Identity Pool ID:", cognitoIdentityPoolId);


    // --- Perform the check INSIDE the function ---
    if (!cognitoRegion || !cognitoUserPoolId || !cognitoUserPoolWebClientId) {
        console.error("Amplify config ERROR: Missing required Cognito variables at the time of configuration. Check .env.local and prefixes.");
        return; // Stop configuration if essential variables are missing
    }

    try {
        // --- Construct the config object using ResourcesConfig structure (v6 style) ---
        // Directly build the object matching the expected structure for Auth.Cognito
        const amplifyConfig: ResourcesConfig = {
            Auth: {
                Cognito: {
                    // REQUIRED - Amazon Cognito User Pool ID
                    userPoolId: cognitoUserPoolId,
                    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
                    userPoolClientId: cognitoUserPoolWebClientId,
                    // OPTIONAL - Set if using Identity Pools for Unauthenticated access or AWS creds
                    // identityPoolId: cognitoIdentityPoolId,
                    // OPTIONAL - Set to true to load hosted UI configuration
                    // loginWith: {
                    //   oauth: {
                    //     domain: 'your_cognito_domain.auth.us-east-1.amazoncognito.com',
                    //     scopes: ['openid email profile aws.cognito.signin.user.admin'],
                    //     redirectSignIn: ['http://localhost:3000/'],
                    //     redirectSignOut: ['http://localhost:3000/logout'],
                    //     responseType: 'code'
                    //   }
                    // }
                }
            }
            // Add other categories like API, Storage here following v6 structure
            // API: { ... }, Storage: { ... }
        };

        // Conditionally add identityPoolId if it exists and is not an empty string
        // Ensure the structure matches ResourcesConfig['Auth']['Cognito']
        if (cognitoIdentityPoolId && cognitoIdentityPoolId.trim() !== '' && amplifyConfig.Auth?.Cognito) {
            amplifyConfig.Auth.Cognito.identityPoolId = cognitoIdentityPoolId;
        }


        // The Amplify.configure function accepts a ResourcesConfig type object
        Amplify.configure(amplifyConfig);
        isConfigured = true;
        console.log("Amplify configured successfully with:", amplifyConfig); // Log the config object

    } catch (error) {
        console.error("Error configuring Amplify:", error);
    }
};
