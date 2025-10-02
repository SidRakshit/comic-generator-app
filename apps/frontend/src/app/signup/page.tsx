// src/app/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "aws-amplify/auth";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { UI_CONSTANTS, SEMANTIC_COLORS, INTERACTIVE_STYLES, PASSWORD_RULES } from "@repo/common-types";
import { validatePasswordStrength } from "@repo/utils";

export default function SignupPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordValidation, setPasswordValidation] = useState<{
		isValid: boolean;
		requirements: string[];
		score: number;
	} | null>(null);
	const router = useRouter();

	const validatePassword = (password: string) => {
		const validation = validatePasswordStrength(password, {
			minLength: PASSWORD_RULES.MIN_LENGTH,
			requireUppercase: PASSWORD_RULES.REQUIRE_UPPERCASE,
			requireLowercase: PASSWORD_RULES.REQUIRE_LOWERCASE,
			requireNumbers: PASSWORD_RULES.REQUIRE_NUMBERS,
			requireSpecialChars: PASSWORD_RULES.REQUIRE_SPECIAL_CHARS,
		});
		setPasswordValidation(validation);
		return validation;
	};

	const handlePasswordChange = (newPassword: string) => {
		setPassword(newPassword);
		if (newPassword.length > 0) {
			validatePassword(newPassword);
		} else {
			setPasswordValidation(null);
		}
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		
		// Validate password using our validation function
		const validation = validatePassword(password);
		if (!validation.isValid) {
			setError(`Password requirements not met: ${validation.requirements.join(', ')}`);
			setIsLoading(false);
			return;
		}
		try {
			const { isSignUpComplete, userId, nextStep } = await signUp({
				username: email,
				password,
				options: { userAttributes: { email } },
			});
			console.log("New user ID:", userId);
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
					// Provide specific password requirements based on our rules
					const requirements = [];
					if (password.length < PASSWORD_RULES.MIN_LENGTH) {
						requirements.push(`at least ${PASSWORD_RULES.MIN_LENGTH} characters`);
					}
					if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
						requirements.push("uppercase letter");
					}
					if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
						requirements.push("lowercase letter");
					}
					if (PASSWORD_RULES.REQUIRE_NUMBERS && !/\d/.test(password)) {
						requirements.push("number");
					}
					if (PASSWORD_RULES.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
						requirements.push("special character");
					}
					setError(`Password must contain: ${requirements.join(', ')}`);
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
			<div className={`w-full max-w-md p-8 space-y-6 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow-md`}>
				{/* Make title explicitly dark */}
				<h2 className={`text-2xl font-bold text-center ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
					Create Account
				</h2>
				{error && <p className={`${SEMANTIC_COLORS.ERROR.TEXT} text-sm text-center`}>{error}</p>}
				<form onSubmit={handleSignup} className="space-y-4">
					<div>
						{/* Add dark text color to Label */}
						<Label htmlFor="email" className={SEMANTIC_COLORS.TEXT.SECONDARY}>
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
						<Label htmlFor="password" className={SEMANTIC_COLORS.TEXT.SECONDARY}>
							Password
						</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => handlePasswordChange(e.target.value)}
							required
							placeholder="********"
							disabled={isLoading}
						/>
						{/* Password requirements display */}
						{passwordValidation && (
							<div className="mt-2">
								<p className={`text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY} mb-1`}>
									Password requirements:
								</p>
								<ul className="text-xs space-y-1">
									{passwordValidation.requirements.map((requirement, index) => (
										<li key={index} className={`flex items-center ${SEMANTIC_COLORS.ERROR.TEXT}`}>
											<span className="mr-2">✗</span>
											{requirement}
										</li>
									))}
									{passwordValidation.isValid && (
										<li className={`flex items-center ${SEMANTIC_COLORS.SUCCESS?.TEXT || 'text-green-600'}`}>
											<span className="mr-2">✓</span>
											All requirements met
										</li>
									)}
								</ul>
							</div>
						)}
						{!passwordValidation && password.length === 0 && (
							<p className={`text-xs ${SEMANTIC_COLORS.TEXT.TERTIARY} mt-1`}>
								{PASSWORD_RULES.REQUIREMENTS_TEXT}
							</p>
						)}
					</div>
					<Button
						type="submit"
						variant="outline" // Use outline variant
						className={`w-full ${SEMANTIC_COLORS.BORDER.DEFAULT} ${SEMANTIC_COLORS.TEXT.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT} bg-white`} // Override colors
						disabled={isLoading}
					>
						{isLoading ? "Creating Account..." : "Sign Up"}
					</Button>
				</form>
				{/* Make descriptive text darker */}
				<p className={`text-center text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY}`}>
					{/* Changed from text-gray-600 */}
					Already have an account? <Link href="/login" legacyBehavior>
						<a className={`font-medium ${SEMANTIC_COLORS.TEXT.ACCENT} ${INTERACTIVE_STYLES.TEXT.HOVER_ACCENT}`}>
							Login
						</a>
					</Link>
				</p>
			</div>
		</div>
	);
}
