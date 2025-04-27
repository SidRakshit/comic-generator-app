// src/lib/api.ts
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Interface for expected successful backend responses (adjust if needed)
interface SuccessResponse<T> {
    id?: string; // Often returned on POST/PUT
    message?: string;
    data?: T; // If data is nested under a 'data' key
    // Add other potential success fields
}

// Interface for expected backend error responses
interface ErrorResponse {
    error: string; // Expect an 'error' message string
    // Add other potential error fields
}

/**
 * Makes an authenticated request to the backend API.
 * Automatically adds the Authorization header with the Cognito Access Token.
 *
 * @param endpoint - The API endpoint (e.g., '/comics', '/comics/generate-panel-image').
 * @param method - HTTP method (GET, POST, PUT, DELETE). Defaults to GET.
 * @param body - Optional request body for POST/PUT requests.
 * @returns A promise that resolves to the JSON response data.
 * @throws An error if the request fails or returns an error status.
 */
export async function apiRequest<T = unknown>( // Keep generic T for flexibility in expected data shape
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown> | null // Body type remains flexible
): Promise<T> { // Return type remains T
    let token: string | undefined;

    try {
        const session = await fetchAuthSession({ forceRefresh: false });
        token = session.tokens?.accessToken?.toString();
    } catch (error: unknown) { // Use unknown
        console.warn("User is likely not authenticated or session expired:", error);
        // Handle error if needed, e.g., redirect to login
        // Or just proceed, letting the API call fail if token is required
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn(`Making API request to ${endpoint} without authentication token.`);
    }

    const config: RequestInit = {
        method: method,
        headers: headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    console.log(`API Request: ${method} ${url}`);

    try {
        const response = await fetch(url, config);

        // Attempt to parse JSON response body
        let responseData: SuccessResponse<T> | ErrorResponse | null = null;
        try {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                responseData = await response.json();
            } else {
                console.log(`Received non-JSON response for ${method} ${url}`);
                // If not JSON, but status is OK, maybe return empty object or handle differently
                if (response.ok) return {} as T;
            }
        } catch (jsonError: unknown) { // Use unknown
            console.warn(`Could not parse JSON response for ${method} ${url}`, jsonError);
            // If parsing failed but status is OK, something is wrong with backend response format
            if (response.ok) throw new Error("Received OK status but failed to parse JSON response.");
            // Otherwise, let the !response.ok check handle it below
        }

        if (!response.ok) {
            // Try to extract error message from parsed JSON or use status text
            const errorMessage = (responseData && typeof responseData === 'object' && 'error' in responseData)
                ? responseData.error // Use error field if present
                : `HTTP error ${response.status}: ${response.statusText}`;

            console.error(`API Error Response (${method} ${url}):`, response.status, responseData || '<No JSON Body>');

            if (response.status === 401) {
                console.error("API returned 401 Unauthorized. User might need to log in again.");
                // Consider global sign-out or redirect here
            }

            throw new Error(errorMessage);
        }

        // If response is OK, return the parsed data
        // Check if the actual data is nested under a 'data' key, common practice
        if (responseData && typeof responseData === 'object' && 'data' in responseData && responseData.data !== undefined) {
            return responseData.data as T;
        }
        // Otherwise, return the whole response object (cast to T, assuming it matches)
        return responseData as T;

    } catch (error: unknown) { // Use unknown
        console.error(`Network or other error during API request (${method} ${url}):`, error);
        // Re-throw the error after logging
        // Ensure it's an Error object for consistent handling upstream
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('An unknown network or API request error occurred.');
        }
    }
}
