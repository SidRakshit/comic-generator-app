// src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "aws-amplify/auth";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label"; // Assuming Label doesn't enforce its own color

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		// ... (handleLogin logic remains the same) ...
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			const { isSignedIn, nextStep } = await signIn({
				username: email,
				password,
			});
			if (isSignedIn) {
				router.push("/profile");
			} else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
				router.push(`/confirm-signup?email=${encodeURIComponent(email)}`);
			} else if (nextStep.signInStep === "RESET_PASSWORD") {
				setError("You need to reset your password.");
			} else {
				setError(`Unhandled sign-in step: ${nextStep.signInStep}`);
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (
					err.name === "UserNotFoundException" ||
					err.name === "NotAuthorizedException"
				) {
					setError("Invalid email or password.");
				} else {
					setError(err.message || "Login failed.");
				}
			} else {
				setError("An unknown error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
				{/* Make title explicitly dark */}
				<h2 className="text-2xl font-bold text-center text-gray-900">Login</h2>
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						{/* Add dark text color to Label */}
						<Label htmlFor="email" className="text-gray-700">
							Email
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="you@example.com"
							disabled={isLoading}
						/>
					</div>
					<div>
						{/* Add dark text color to Label */}
						<Label htmlFor="password" className="text-gray-700">
							Password
						</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="********"
							disabled={isLoading}
						/>
					</div>
					<Button
						type="submit"
						variant="outline" // Use outline variant
						className="w-full border-black text-black hover:bg-gray-100 hover:text-black" // Override colors
						disabled={isLoading}
					>
						{isLoading ? "Logging in..." : "Login"}
					</Button>
				</form>
				{/* Make descriptive text darker */}
				<p className="text-center text-sm text-gray-700">
					{" "}
					{/* Changed from text-gray-600 */}
					Don&apos;t have an account?{" "}
					<Link href="/signup" legacyBehavior>
						<a className="font-medium text-blue-600 hover:text-blue-500">
							Sign up
						</a>
					</Link>
				</p>
			</div>
		</div>
	);
}
