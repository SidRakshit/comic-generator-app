// src/context/auth-context.tsx
"use client";

import React, {
	createContext,
	// Removed useContext import as the hook is now separate
	useState,
	useEffect,
	ReactNode,
	useCallback,
	useMemo,
} from "react";
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

// Define a default state
// Note: The consumer hook will handle throwing errors if used outside provider client-side
const defaultAuthContextValue: AuthContextType = {
	user: null,
	userId: null,
	attributes: null,
	isLoading: true, // Start true until initial check/config
	error: null,
	getAccessToken: async () => null,
	handleSignOut: async () => {},
};

// Export the Context object itself - needed by the useAuth hook
// Default value here acts as a fallback during SSR/build before provider mounts
export const AuthContext = createContext<AuthContextType>(
	defaultAuthContextValue
);

// Export the Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [attributes, setAttributes] = useState<UserAttributes | null>(null);
	const [isLoading, setIsLoading] = useState(true); // Start true
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

	// Define handleSignOut
	const handleSignOut = useCallback(async () => {
		if (!isAmplifyConfigured) {
			console.error("handleSignOut: Amplify not configured.");
			return;
		}
		// Consider setting loading true only if needed visually
		// setIsLoading(true);
		setError(null);
		try {
			await signOut({ global: true });
			// State updates will be handled by the Hub listener now
			console.log("Sign out initiated.");
		} catch (error: unknown) {
			console.error("Error initiating sign out: ", error);
			setError(error instanceof Error ? error : new Error("Sign out failed"));
			// setIsLoading(false); // Reset loading on error if set true
		}
		// Let Hub listener handle final state changes including loading
	}, [isAmplifyConfigured]);

	// Define checkCurrentUser
	const checkCurrentUser = useCallback(async () => {
		if (!isAmplifyConfigured) {
			console.log("checkCurrentUser: Amplify not configured yet, skipping.");
			setIsLoading(true); // Ensure loading remains true if not configured
			return;
		}
		console.log("checkCurrentUser: Checking current user...");
		// Don't reset error here maybe? Or maybe do? Depends on desired UX
		// setError(null);
		// Initial load, so isLoading should be true already
		try {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
			setUserId(currentUser.userId);
			// Maybe fetch attributes here too? Example:
			// const userAttributes = await fetchUserAttributes();
			// setAttributes(userAttributes);
			console.log(
				"Current user found:",
				currentUser.username,
				currentUser.userId
			);
		} catch (err: unknown) {
			console.log("No current user found or error fetching:", err);
			setUser(null);
			setUserId(null);
			setAttributes(null); // Clear attributes if user not found
			if (
				err instanceof Error &&
				err.name !== "UserNotFoundException" &&
				err.message !== "The user is not authenticated"
			) {
				// Don't set error for expected "not logged in" cases
				setError(err);
			} else {
				setError(null); // Clear previous errors if it's just "not logged in"
			}
		} finally {
			// Only set loading false after the *initial* check completes
			setIsLoading(false);
		}
	}, [isAmplifyConfigured]);

	// Define getAccessToken
	const getAccessToken = useCallback(async (): Promise<string | null> => {
		if (!isAmplifyConfigured) {
			console.error("getAccessToken: Amplify not configured.");
			return null;
		}
		try {
			const session = await fetchAuthSession({ forceRefresh: false }); // Consider if refresh needed
			const token = session.tokens?.accessToken?.toString();
			// console.log("Access Token:", token); // careful logging tokens
			return token || null;
		} catch (error: unknown) {
			console.error("Error fetching auth session/token:", error);
			// Consider signing out if session fails completely
			// await handleSignOut();
			setError(
				error instanceof Error ? error : new Error("Failed to fetch session")
			);
			return null;
		}
	}, [isAmplifyConfigured /*, handleSignOut */]); // Add handleSignOut if called on error

	// Effect for Hub listener
	useEffect(() => {
		if (isAmplifyConfigured) {
			checkCurrentUser(); // Initial check

			type AuthPayload = { event: string; data?: unknown; message?: string };

			const hubListenerCancel = Hub.listen(
				"auth",
				({ payload }: { payload: AuthPayload }) => {
					console.log("Amplify Auth Hub event:", payload.event);
					switch (payload.event) {
						case "signedIn":
						case "signInWithRedirect":
						case "autoSignIn": // Handle auto sign-in event if configured
							checkCurrentUser();
							break;
						case "signedOut":
							setUser(null);
							setUserId(null);
							setAttributes(null);
							setError(null);
							setIsLoading(false); // Ensure loading is false after sign out
							break;
						// Add other cases as needed (tokenRefresh, failures)
						case "tokenRefresh":
							console.log("Hub: Token refreshed");
							// Potentially update something if needed, or just log
							break;
						case "tokenRefresh_failure":
						case "signInWithRedirect_failure":
						case "autoSignIn_failure": // Handle auto sign-in failure
							console.error(
								"Hub: Auth failure event:",
								payload.event,
								payload.data
							);
							// Maybe sign out completely on critical failures
							// handleSignOut();
							setError(
								new Error(
									`Auth event failed: ${payload.event} ${payload.message || ""}`
								)
							);
							setIsLoading(false); // Ensure loading is false on failure
							break;

						default:
							break; // Ignore other events
					}
				}
			);

			return () => {
				hubListenerCancel();
			};
		}
	}, [isAmplifyConfigured, checkCurrentUser, handleSignOut]); // Dependencies

	// Memoize the context value
	const value = useMemo(
		() => ({
			user,
			userId,
			attributes,
			isLoading: !isAmplifyConfigured || isLoading, // Loading if not configured OR initial check running
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

// NO useAuth hook exported from this file anymore
