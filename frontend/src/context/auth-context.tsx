// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Hub, HubCapsule } from 'aws-amplify/utils'; // Import HubCapsule for payload typing
import { getCurrentUser, fetchAuthSession, signOut, type AuthUser } from 'aws-amplify/auth';
import { configureAmplify } from '@/lib/amplify-config';

interface AuthContextType {
    user: AuthUser | null;
    userId: string | null;
    isLoading: boolean;
    error: Error | null;
    getAccessToken: () => Promise<string | null>;
    handleSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false);

    // Configure Amplify on client-side
    useEffect(() => {
        if (!isAmplifyConfigured) {
            configureAmplify();
            setIsAmplifyConfigured(true);
            console.log("Amplify configured via useEffect.");
        }
    }, [isAmplifyConfigured]);

    // Define handleSignOut first as it's used in the Hub listener effect dependency array
    const handleSignOut = useCallback(async () => { // Make it useCallback
         if (!isAmplifyConfigured) {
              console.error("handleSignOut: Amplify not configured.");
              return;
         }
        setIsLoading(true);
        try {
            await signOut({ global: true });
            setUser(null);
            setUserId(null);
            console.log("User signed out successfully.");
        } catch (error: unknown) {
            console.error('Error signing out: ', error);
            setError(error instanceof Error ? error : new Error('Sign out failed'));
        } finally {
             setIsLoading(false);
        }
    }, [isAmplifyConfigured]); // Dependency: isAmplifyConfigured


    const checkCurrentUser = useCallback(async () => {
        if (!isAmplifyConfigured) {
             console.log("checkCurrentUser: Amplify not configured yet, skipping.");
             setIsLoading(true);
             return;
        }
        console.log("checkCurrentUser: Checking current user...");
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setUserId(currentUser.userId);
            console.log("Current user found:", currentUser.username, currentUser.userId);
        } catch (err: unknown) {
            console.log("No current user found or error fetching:", err);
            setUser(null);
            setUserId(null);
            if (err instanceof Error && err.name !== 'UserNotFoundException' && err.message !== 'The user is not authenticated') {
                 setError(err);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAmplifyConfigured]);

    const getAccessToken = useCallback(async (): Promise<string | null> => {
         if (!isAmplifyConfigured) {
              console.error("getAccessToken: Amplify not configured.");
              return null;
         }
        try {
            const session = await fetchAuthSession({ forceRefresh: false });
            const token = session.tokens?.accessToken?.toString();
            if (!token) {
                console.warn("No access token found in session.");
                return null;
            }
            return token;
        } catch (error: unknown) {
            console.error("Error fetching auth session/token:", error);
            setUser(null);
            setUserId(null);
            return null;
        }
    }, [isAmplifyConfigured]);


    // Effect to check user initially and set up Hub listener
    useEffect(() => {
        if (isAmplifyConfigured) {
            checkCurrentUser(); // Initial check

            const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
                console.log("Amplify Auth Hub event:", payload.event);
                switch (payload.event) {
                    case 'signedIn':
                    case 'signInWithRedirect': // Handle completion of hosted UI redirect
                        console.log("Hub: signedIn or signInWithRedirect detected, checking user...");
                        checkCurrentUser();
                        break;
                    case 'signedOut':
                        console.log("Hub: signedOut detected.");
                        setUser(null);
                        setUserId(null);
                        break;
                    case 'tokenRefresh':
                        console.log('Hub: Token refreshed');
                        break;
                    case 'tokenRefresh_failure':
                    case 'signInWithRedirect_failure':
                        console.error('Hub: Auth failure event:', payload.event, payload.data);
                        handleSignOut();
                        break;
                    default:
                         // Use a type assertion if you need to access specific properties of payload.data for unhandled events
                         // const eventData = payload.data as { someProperty?: string }; // Example
                         console.log("Hub: Unhandled auth event:", payload.event);
                         break;
                }
            });

            // Cleanup listener on unmount
            return () => {
                console.log("Cleaning up Hub listener.");
                hubListenerCancel();
            };
        }
    }, [isAmplifyConfigured, checkCurrentUser, handleSignOut]); // Added handleSignOut to dependency array


    const value = {
        user,
        userId,
        isLoading: !isAmplifyConfigured || isLoading,
        error,
        getAccessToken,
        handleSignOut,
    };

    // Render children only after Amplify is configured
    return (
         <AuthContext.Provider value={value}>
            {isAmplifyConfigured ? children : <div>Loading Authentication...</div>}
         </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
