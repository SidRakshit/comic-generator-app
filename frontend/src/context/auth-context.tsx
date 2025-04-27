// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Hub, HubCapsule } from 'aws-amplify/utils';
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

// Define a default state for the context, especially for SSR/build phase
const defaultAuthContextValue: AuthContextType = {
    user: null,
    userId: null,
    isLoading: true, // Default to loading on server/initial state
    error: null,
    getAccessToken: async () => null,
    handleSignOut: async () => {},
};


// Create context with a default value that matches the type
// *** EXPORT the context itself ***
export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);


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
    const handleSignOut = useCallback(async () => {
         if (!isAmplifyConfigured) {
              console.error("handleSignOut: Amplify not configured.");
              return;
         }
        setIsLoading(true);
        setError(null);
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
    }, [isAmplifyConfigured]);


    const checkCurrentUser = useCallback(async () => {
        if (!isAmplifyConfigured) {
             console.log("checkCurrentUser: Amplify not configured yet, skipping.");
             setIsLoading(true);
             return;
        }
        console.log("checkCurrentUser: Checking current user...");
        setError(null);
        try {
            // Don't set loading true here, let the initial state handle it
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
            // Set loading false only after the *initial* check is complete
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
            setError(error instanceof Error ? error : new Error('Failed to fetch session'));
            return null;
        }
    }, [isAmplifyConfigured]);


    // Effect to check user initially and set up Hub listener
    useEffect(() => {
        if (isAmplifyConfigured) {
            checkCurrentUser(); // Initial check

            const hubListenerCancel = Hub.listen('auth', ({ payload }: HubCapsule<'auth', any>) => {
                console.log("Amplify Auth Hub event:", payload.event, payload.data);
                switch (payload.event) {
                    case 'signedIn':
                    case 'signInWithRedirect':
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
                         console.log("Hub: Unhandled auth event:", payload.event);
                         break;
                }
            });

            return () => {
                console.log("Cleaning up Hub listener.");
                hubListenerCancel();
            };
        }
    }, [isAmplifyConfigured, checkCurrentUser, handleSignOut]);


    // Memoize the context value
    const value = React.useMemo(() => ({
        user,
        userId,
        isLoading: !isAmplifyConfigured || isLoading,
        error,
        getAccessToken,
        handleSignOut,
    }), [user, userId, isAmplifyConfigured, isLoading, error, getAccessToken, handleSignOut]);

    // Render children immediately, value.isLoading handles loading state
    return (
         <AuthContext.Provider value={value}>
            {children}
         </AuthContext.Provider>
    );
};

// --- REMOVED the useAuth hook export from this file ---
// export const useAuth = (): AuthContextType => { ... };
