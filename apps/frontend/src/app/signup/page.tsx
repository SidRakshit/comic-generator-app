// src/app/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "aws-amplify/auth";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

export default function SignupPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignup = async (e: React.FormEvent) => {
		// ... (handleSignup logic remains the same) ...
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		if (password.length < 8) {
			setError("Password must be at least 8 characters long.");
			setIsLoading(false);
			return;
		}
		try {
			const { isSignUpComplete, userId, nextStep } = await signUp({
				username: email,
				password,
				options: { userAttributes: { email } },
			});
			if (isSignUpComplete) {
				router.push("/profile");
			} else if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
				router.push(`/confirm-signup?email=${encodeURIComponent(email)}`);
			} else {
				setError(`Unhandled sign up step: ${nextStep.signUpStep}`);
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (err.name === "UsernameExistsException") {
					setError("An account with this email already exists.");
				} else if (
					err.message?.includes("password policy") ||
					err.name === "InvalidPasswordException"
				) {
					setError("Password does not meet the requirements.");
				} else if (err.name === "InvalidParameterException") {
					setError("Invalid input provided.");
				} else {
					setError(err.message || "Sign up failed.");
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
				<h2 className="text-2xl font-bold text-center text-gray-900">
					Create Account
				</h2>
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
				<form onSubmit={handleSignup} className="space-y-4">
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
						{/* Make descriptive text darker */}
						<p className="text-xs text-gray-600 mt-1">
							{" "}
							{/* Changed from text-gray-500 */}
							Min. 8 characters. Consider adding complexity requirements.
						</p>
					</div>
					<Button
						type="submit"
						variant="outline" // Use outline variant
						className="w-full border-black text-black hover:bg-gray-100 hover:text-black" // Override colors
						disabled={isLoading}
					>
						{isLoading ? "Creating Account..." : "Sign Up"}
					</Button>
				</form>
				{/* Make descriptive text darker */}
				<p className="text-center text-sm text-gray-700">
					{" "}
					{/* Changed from text-gray-600 */}
					Already have an account?{" "}
					<Link href="/login" legacyBehavior>
						<a className="font-medium text-blue-600 hover:text-blue-500">
							Login
						</a>
					</Link>
				</p>
			</div>
		</div>
	);
}
