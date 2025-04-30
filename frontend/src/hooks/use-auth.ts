// src/hooks/use-auth.ts
import { useContext } from "react";
// Import the context object and its type from the context file
import { AuthContext, type AuthContextType } from "@/context/auth-context"; // Adjust path if necessary

// Export the consumer hook
export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	// Essential check: ensure the hook is used within the AuthProvider tree client-side
	// Uses comparison to null assuming createContext default is null before hydration
	// Or potentially check reference against exported defaultAuthContextValue if not null
	if (context === null && typeof window !== "undefined") {
		// This error is helpful during development!
		throw new Error(
			"useAuth must be used within an AuthProvider (context is null)"
		);
	}

	// Handle case where context might still be the initial default value object
	// This check might be removed if the null check is deemed sufficient
	// Or adjust based on how defaultAuthContextValue is defined and exported
	/*
    if (context === defaultAuthContextValue && typeof window !== 'undefined') {
         throw new Error('useAuth must be used within an AuthProvider (context is default)');
    }
    */

	// If context is null even after checks (shouldn't happen if provider wraps app correctly)
	if (context === null) {
		console.error(
			"AuthContext is null, returning potentially unsafe default. Ensure AuthProvider wraps the app."
		);
		// Returning default here might hide issues, throwing is usually better.
		// For robustness, let's throw instead of returning default here too.
		throw new Error("AuthContext is null - AuthProvider likely missing.");
		// return defaultAuthContextValue; // Less safe alternative
	}

	// Return the context value obtained from the provider
	return context;
}
