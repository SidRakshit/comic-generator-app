// src/app/confirm-signup/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Component containing the actual logic, to allow use of hooks
function ConfirmSignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Get email from query parameter passed from signup page
    const initialEmail = searchParams.get('email') || '';

    const [email, setEmail] = useState(initialEmail); // Use email as Cognito username
    const [confirmationCode, setConfirmationCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [resendTimer, setResendTimer] = useState(0); // Timer state

    // Update email state if query param changes
    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

     // Timer effect for resend button
     useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true); // Enable resend when timer hits 0
            if (interval) clearInterval(interval);
        }
        return () => { // Cleanup interval on component unmount or timer reset
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    const handleConfirm = async (e: React.FormEvent) => {
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
                username: email, // Use email as the Cognito username
                confirmationCode: confirmationCode,
            });

            console.log("Confirm sign up result:", { isSignUpComplete, nextStep });

            if (isSignUpComplete) {
                setSuccessMessage("Account confirmed successfully! Redirecting to login...");
                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                // This path might indicate other steps remaining, though usually confirmation is the last step
                console.warn("Confirmation step might not be fully complete:", nextStep.signUpStep);
                setError(`Confirmation processed, but next step is: ${nextStep.signUpStep}`);
            }

        } catch (err: unknown) { // Use unknown instead of any
            console.error('Error confirming sign up:', err);
             // Type check and handle specific Amplify error names
             if (err instanceof Error) {
                 if (err.name === 'CodeMismatchException') {
                     setError('Invalid confirmation code. Please try again.');
                 } else if (err.name === 'ExpiredCodeException') {
                     setError('Confirmation code has expired. Please request a new one.');
                     setCanResend(true); // Allow resend immediately
                     setResendTimer(0); // Reset timer
                 } else if (err.name === 'UserNotFoundException') {
                      setError('User not found. Please check the email or sign up again.');
                 } else if (err.name === 'AliasExistsException') {
                      setError('This email might already be confirmed or associated with another account.');
                 } else {
                     setError(err.message || 'Confirmation failed. Please try again.');
                 }
             } else {
                 setError('An unknown error occurred during confirmation.');
             }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email || !canResend) return;
        setIsLoading(true); // Consider separate loading state for resend
        setError(null);
        setSuccessMessage(null);
        setCanResend(false); // Disable button immediately
        setResendTimer(60); // Start 60 second timer

        try {
            await resendSignUpCode({ username: email });
            setSuccessMessage("Confirmation code resent successfully. Check your email.");
            // Timer will re-enable button via useEffect
        } catch (err: unknown) { // Use unknown instead of any
            console.error('Error resending code:', err);
             // Type check and handle specific Amplify error names
             if (err instanceof Error) {
                 if (err.name === 'LimitExceededException') {
                     setError('Attempt limit exceeded. Please try again later.');
                      // Keep button disabled longer maybe
                 } else if (err.name === 'UserNotFoundException'){
                      setError('Cannot resend code: User not found with this email.');
                 }
                 else {
                     setError(err.message || 'Failed to resend code.');
                 }
             } else {
                 setError('An unknown error occurred while resending the code.');
             }
            setCanResend(true); // Re-enable immediately on error
             setResendTimer(0); // Reset timer on error
        } finally {
            setIsLoading(false); // Reset loading state for main button
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Confirm Sign Up</h2>
                <p className="text-center text-sm text-gray-600">
                    We sent a confirmation code to your email: <strong>{email || 'your email'}</strong>.
                </p>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

                <form onSubmit={handleConfirm} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            // Make email read-only if passed via query param, allow editing otherwise
                            readOnly={!!initialEmail}
                            disabled={isLoading}
                            className={!!initialEmail ? "bg-gray-100" : ""}
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirmationCode">Confirmation Code</Label>
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Confirming...' : 'Confirm Account'}
                    </Button>
                </form>
                <div className="text-center text-sm">
                    <Button
                        variant="link"
                        onClick={handleResendCode}
                        disabled={isLoading || !canResend || !email}
                        className="font-medium text-blue-600 hover:text-blue-500 p-0 h-auto"
                    >
                        {canResend ? 'Resend Code' : `Resend available in ${resendTimer}s`}
                    </Button>
                </div>
                <p className="text-center text-sm text-gray-600">
                    Already confirmed?{' '}
                    <Link href="/login" legacyBehavior><a className="font-medium text-blue-600 hover:text-blue-500">Login</a></Link>
                </p>
            </div>
        </div>
    );
}

// Wrap with Suspense because useSearchParams is used
export default function ConfirmSignupPage() {
    // Use Suspense to handle the initial render while useSearchParams reads the URL
    return (
        <Suspense fallback={<div>Loading confirmation page...</div>}>
            <ConfirmSignupContent />
        </Suspense>
    );
}
