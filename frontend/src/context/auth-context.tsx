// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser, fetchAuthSession, signOut, type AuthUser } from 'aws-amplify/auth';
import { configureAmplify } from '@/lib/amplify-config'; // Import config function

// Configure Amplify on initial load
configureAmplify();

interface AuthContextType {
    user: AuthUser | null; // Amplify's AuthUser type
    userId: string | null; // The user's unique 'sub' identifier
    isLoading: boolean;
    error: Error | null;
    getAccessToken: () => Promise<string | null>;
    handleSignOut: () => Promise<void>;
    // Add other functions if needed (e.g., initiating sign-in flow)
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userId, setUserId] = useState<string | null>(null); // Store the 'sub'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const checkCurrentUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setUserId(currentUser.userId); // 'userId' in AuthUser is the 'sub'
            console.log("Current user found:", currentUser.username, currentUser.userId);
        } catch (err) {
            console.log("No current user found or error fetching:", err);
            setUser(null);
            setUserId(null);
            // Don't set error state for "no user found" on initial load
            if ((err as Error).name !== 'UserNotFoundException' && (err as Error).message !== 'The user is not authenticated') {
                 setError(err instanceof Error ? err : new Error('Failed to fetch user session'));
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAccessToken = useCallback(async (): Promise<string | null> => {
        try {
            // fetchAuthSession automatically handles refresh if needed
            const session = await fetchAuthSession({ forceRefresh: false }); // Set forceRefresh: true if needed
            const token = session.tokens?.accessToken?.toString();
            if (!token) {
                console.warn("No access token found in session.");
                return null;
            }
            return token;
        } catch (error) {
            console.error("Error fetching auth session/token:", error);
            // Handle specific errors, e.g., redirect to login if not authenticated
            setUser(null); // Clear user state if session fetch fails
            setUserId(null);
            return null;
        }
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({ global: true }); // Sign out from all devices
            setUser(null);
            setUserId(null);
            console.log("User signed out successfully.");
            // Optionally redirect to home or login page
            // window.location.href = '/login'; // Simple redirect
        } catch (error) {
            console.error('Error signing out: ', error);
            setError(error instanceof Error ? error : new Error('Sign out failed'));
        } finally {
             setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check user on initial load
        checkCurrentUser();

        // Listen for auth events (login, logout) using Amplify Hub
        const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
             console.log("Amplify Auth Hub event:", payload.event);
            switch (payload.event) {
                case 'signedIn':
                    checkCurrentUser(); // Re-check user after sign in
                    break;
                case 'signedOut':
                    setUser(null); // Clear user on sign out event
                    setUserId(null);
                    break;
                case 'tokenRefresh':
                    console.log('Token refreshed');
                    // Session might be updated, could re-fetch if needed, but getAccessToken handles it
                    break;
                case 'tokenRefresh_failure':
                    console.error('Token refresh failed');
                    handleSignOut(); // Sign out if refresh fails
                    break;
                case 'signInWithRedirect':
                    // Handle redirect sign-in if using Hosted UI
                    checkCurrentUser();
                    break;
                 case 'signInWithRedirect_failure':
                     console.error('Redirect sign-in failed');
                     setError(new Error('Sign in failed.'));
                     break;
                // Add other cases as needed
            }
        });

        // Cleanup listener on unmount
        return () => {
            hubListenerCancel();
        };
    }, [checkCurrentUser]); // Include checkCurrentUser in dependency array

    const value = {
        user,
        userId,
        isLoading,
        error,
        getAccessToken,
        handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
