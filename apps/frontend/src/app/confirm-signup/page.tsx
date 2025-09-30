// src/app/confirm-signup/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { SEMANTIC_COLORS, INTERACTIVE_STYLES, UI_CONSTANTS } from "@repo/common-types";

function ConfirmSignupContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialEmail = searchParams.get("email") || "";

	const [email, setEmail] = useState(initialEmail);
	const [confirmationCode, setConfirmationCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [canResend, setCanResend] = useState(true);
	const [resendTimer, setResendTimer] = useState(0);

	useEffect(() => {
		setEmail(initialEmail);
	}, [initialEmail]);
	useEffect(() => {
		// ... (timer logic remains the same) ...
		let interval: NodeJS.Timeout | null = null;
		if (resendTimer > 0) {
			interval = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
		} else if (resendTimer === 0) {
			setCanResend(true);
			if (interval) clearInterval(interval);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [resendTimer]);

	const handleConfirm = async (e: React.FormEvent) => {
		// ... (handleConfirm logic remains the same) ...
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);
		if (!email || !confirmationCode) {
			setError("Email and confirmation code are required.");
			setIsLoading(false);
			return;
		}
		try {
			const { isSignUpComplete, nextStep } = await confirmSignUp({
				username: email,
				confirmationCode,
			});
			if (isSignUpComplete) {
				setSuccessMessage("Account confirmed successfully! Redirecting...");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} else {
				setError(
					`Confirmation processed, but next step is: ${nextStep.signUpStep}`
				);
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (err.name === "CodeMismatchException") {
					setError("Invalid confirmation code.");
				} else if (err.name === "ExpiredCodeException") {
					setError("Confirmation code has expired. Please request a new one.");
					setCanResend(true);
					setResendTimer(0);
				} else if (err.name === "UserNotFoundException") {
					setError("User not found. Check the email or sign up again.");
				} else if (err.name === "AliasExistsException") {
					setError("Email may already be confirmed or linked.");
				} else {
					setError(err.message || "Confirmation failed.");
				}
			} else {
				setError("An unknown error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		// ... (handleResendCode logic remains the same) ...
		if (!email || !canResend) return;
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);
		setCanResend(false);
		setResendTimer(60);
		try {
			await resendSignUpCode({ username: email });
			setSuccessMessage("Confirmation code resent. Check your email.");
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (err.name === "LimitExceededException") {
					setError("Attempt limit exceeded.");
				} else if (err.name === "UserNotFoundException") {
					setError("Cannot resend code: User not found.");
				} else {
					setError(err.message || "Failed to resend code.");
				}
			} else {
				setError("An unknown error occurred.");
			}
			setCanResend(true);
			setResendTimer(0);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
			<div className={`w-full max-w-md p-8 space-y-6 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow-md`}>
				{/* Make title explicitly dark */}
				<h2 className={`text-2xl font-bold text-center ${SEMANTIC_COLORS.TEXT.PRIMARY}`}>
					Confirm Sign Up
				</h2>
				{/* Make descriptive text darker */}
				<p className="text-center text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY}">
					{/* Changed from text-gray-600 */}
					We sent a confirmation code to your email: <strong>{email || "your email"}</strong>.
				</p>
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
				{successMessage && (
					<p className="text-green-600 text-sm text-center">{successMessage}</p>
				)}

				<form onSubmit={handleConfirm} className="space-y-4">
					<div>
						{/* Add dark text color to Label */}
						<Label htmlFor="email" className="${SEMANTIC_COLORS.TEXT.SECONDARY}">
							Email
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="you@example.com"
							readOnly={!!initialEmail}
							disabled={isLoading}
							className={!!initialEmail ? SEMANTIC_COLORS.BACKGROUND.SECONDARY : ""}
						/>
					</div>
					<div>
						{/* Add dark text color to Label */}
						<Label htmlFor="confirmationCode" className="${SEMANTIC_COLORS.TEXT.SECONDARY}">
							Confirmation Code
						</Label>
						<Input
							id="confirmationCode"
							type="text"
							value={confirmationCode}
							onChange={(e) => setConfirmationCode(e.target.value)}
							required
							placeholder="Enter code from email"
							disabled={isLoading}
						/>
					</div>
					<Button
						type="submit"
						variant="outline" // Use outline variant
						className={`w-full ${SEMANTIC_COLORS.BORDER.DEFAULT} ${SEMANTIC_COLORS.TEXT.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}`} // Override colors
						disabled={isLoading}
					>
						{isLoading ? "Confirming..." : "Confirm Account"}
					</Button>
				</form>
				<div className="text-center text-sm">
					<Button
						variant="link"
						onClick={handleResendCode}
						disabled={isLoading || !canResend || !email}
						className="font-medium ${SEMANTIC_COLORS.TEXT.ACCENT} ${INTERACTIVE_STYLES.TEXT.HOVER_ACCENT} p-0 h-auto"
					>
						{canResend ? "Resend Code" : `Resend available in ${resendTimer}s`}
					</Button>
				</div>
				{/* Make descriptive text darker */}
				<p className="text-center text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY}">
					{/* Changed from text-gray-600 */}
					Already confirmed? <Link href="/login" legacyBehavior>
						<a className="font-medium ${SEMANTIC_COLORS.TEXT.ACCENT} ${INTERACTIVE_STYLES.TEXT.HOVER_ACCENT}">
							Login
						</a>
					</Link>
				</p>
			</div>
		</div>
	);
}

export default function ConfirmSignupPage() {
	return (
		// Add dark text color to fallback
		<Suspense
			fallback={
				<div className="p-8 text-center text-gray-900">
					Loading confirmation page...
				</div>
			}
		>
			<ConfirmSignupContent />
		</Suspense>
	);
}
