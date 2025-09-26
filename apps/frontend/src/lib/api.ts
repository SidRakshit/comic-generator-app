import { fetchAuthSession } from "aws-amplify/auth";
import { GeneratedImageDataResponse, API_CONFIG } from "@repo/common-types";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || API_CONFIG.DEFAULT_BACKEND_URL;

// Re-export for backward compatibility
export type { GeneratedImageDataResponse };

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
export async function apiRequest<T = unknown>(
	endpoint: string,
	method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
	body?: unknown
): Promise<T> {
	let token: string | undefined;

	try {
		const session = await fetchAuthSession({ forceRefresh: false });
		token = session.tokens?.accessToken?.toString();
	} catch (error: unknown) {
		console.warn("User is likely not authenticated or session expired:", error);
	}

	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	} else {
		console.warn(
			`Making API request to ${endpoint} without authentication token.`
		);
	}

	const config: RequestInit = { method: method, headers: headers };
	if (body && (method === "POST" || method === "PUT")) {
		config.body = JSON.stringify(body);
	}

	const url = `${API_BASE_URL}${
		endpoint.startsWith("/") ? "" : "/"
	}${endpoint}`;
	console.log(`API Request: ${method} ${url}`);

	try {
		const response = await fetch(url, config);
		let responseData: unknown = null;

		try {
			const contentType = response.headers.get("content-type");
			if (contentType?.includes("application/json")) {
				responseData = await response.json();
			} else if (response.ok) {
				console.log(`Received non-JSON OK response for ${method} ${url}`);
				return {} as T;
			}
		} catch (jsonError: unknown) {
			console.warn(
				`Could not parse JSON response for ${method} ${url}`,
				jsonError
			);
			if (response.ok)
				throw new Error(
					"Received OK status but failed to parse JSON response."
				);
		}

		if (!response.ok) {
			const isErrorObject =
				responseData !== null &&
				typeof responseData === "object" &&
				"error" in responseData &&
				typeof (responseData as { error: unknown }).error === "string";

			const errorMessage = isErrorObject
				? (responseData as { error: string }).error
				: `HTTP error ${response.status}: ${response.statusText}`;

			console.error(
				`API Error Response (${method} ${url}):`,
				response.status,
				responseData || "<No JSON Body>"
			);
			if (response.status === 401) {
				console.error("API returned 401 Unauthorized.");
			}
			throw new Error(errorMessage);
		}

		return responseData as T;
	} catch (error: unknown) {
		console.error(
			`Network or other error during API request (${method} ${url}):`,
			error
		);
		if (error instanceof Error) {
			throw error;
		} else {
			throw new Error("An unknown network or API request error occurred.");
		}
	}
}
