// src/context/auth-context.tsx
"use client";

import React, {
	createContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
	useMemo,
} from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { Hub } from "aws-amplify/utils";
import {
	getCurrentUser,
	fetchAuthSession,
	signOut,
	type AuthUser,
	type FetchUserAttributesOutput,
} from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify-config";

type UserAttributes = FetchUserAttributesOutput;

// Export the type for use in the hook and potentially components
export interface AuthContextType {
	user: AuthUser | null;
	userId: string | null;
	attributes: UserAttributes | null;
	isLoading: boolean;
	error: Error | null;
	getAccessToken: () => Promise<string | null>;
	handleSignOut: () => Promise<void>;
}

// Default value
const defaultAuthContextValue: AuthContextType = {
	user: null,
	userId: null,
	attributes: null,
	isLoading: true,
	error: null,
	getAccessToken: async () => null,
	handleSignOut: async () => {},
};

// Export the Context object itself
export const AuthContext = createContext<AuthContextType>(
	defaultAuthContextValue
);

// Export the Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const router = useRouter(); // 2. Get router instance

	// State declarations...
	const [user, setUser] = useState<AuthUser | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [attributes, setAttributes] = useState<UserAttributes | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false);

	// useEffect for configureAmplify...
	useEffect(() => {
		if (!isAmplifyConfigured) {
			configureAmplify();
			setIsAmplifyConfigured(true);
		}
	}, [isAmplifyConfigured]);

	// --- MODIFIED handleSignOut ---
	const handleSignOut = useCallback(async () => {
		if (!isAmplifyConfigured) return;
		setError(null);
		try {
			await signOut({ global: true });
			// User state etc. will be cleared via Hub listener below
			console.log("Sign out successful via handleSignOut, redirecting...");
			router.push("/"); // 3. Redirect to homepage after signout
		} catch (error: unknown) {
			console.error("Error signing out: ", error);
			setError(error instanceof Error ? error : new Error("Sign out failed"));
		}
	}, [isAmplifyConfigured, router]); // Add router to dependencies
	// --- END MODIFIED handleSignOut ---

	// useCallback for checkCurrentUser...
	const checkCurrentUser = useCallback(async () => {
		if (!isAmplifyConfigured) {
			setIsLoading(true);
			return;
		}
		try {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
			setUserId(currentUser.userId);
		} catch (err: unknown) {
			setUser(null);
			setUserId(null);
			setAttributes(null);
			// if ( /* Check if it's an unexpected error */ ) { setError(err as Error); } else { setError(null); }
		} finally {
			setIsLoading(false);
		}
	}, [isAmplifyConfigured]);

	// useCallback for getAccessToken...
	const getAccessToken = useCallback(async (): Promise<string | null> => {
		if (!isAmplifyConfigured) return null;
		try {
			const session = await fetchAuthSession();
			return session.tokens?.accessToken?.toString() || null;
		} catch (error: unknown) {
			setError(error as Error);
			return null;
		}
	}, [isAmplifyConfigured]);

	// useEffect for Hub listener...
	useEffect(() => {
		if (isAmplifyConfigured) {
			checkCurrentUser(); // Initial check
			type AuthPayload = { event: string; data?: unknown; message?: string };
			const hubListenerCancel = Hub.listen(
				"auth",
				({ payload }: { payload: AuthPayload }) => {
					console.log("Hub Event:", payload.event);
					switch (payload.event) {
						case "signedIn":
						case "signInWithRedirect":
						case "autoSignIn":
							checkCurrentUser();
							break;
						case "signedOut":
							// Clear state when Hub detects sign out externally/globally
							setUser(null);
							setUserId(null);
							setAttributes(null);
							setError(null);
							setIsLoading(false);
							// No redirect here - only redirect on explicit handleSignOut call
							break;
						// Handle failures...
						case "tokenRefresh_failure":
						case "signInWithRedirect_failure":
						case "autoSignIn_failure":
							console.error("Hub: Auth failure event:", payload.event);
							setError(
								new Error(
									`Auth event failed: ${payload.event} ${payload.message || ""}`
								)
							);
							setIsLoading(false);
							break;
						default:
							break;
					}
				}
			);
			return () => {
				hubListenerCancel();
			};
		}
	}, [
		isAmplifyConfigured,
		checkCurrentUser /* removed handleSignOut from here */,
	]); // handleSignOut doesn't need to be dependency for listener

	// Memoize the context value...
	const value = useMemo(
		() => ({
			user,
			userId,
			attributes,
			isLoading: !isAmplifyConfigured || isLoading,
			error,
			getAccessToken,
			handleSignOut,
		}),
		[
			user,
			userId,
			attributes,
			isAmplifyConfigured,
			isLoading,
			error,
			getAccessToken,
			handleSignOut,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Remember: no useAuth hook in this file
