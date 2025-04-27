// src/app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
    // Removed username state - using email as Cognito username
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Add password policy validation here if desired (e.g., length, complexity)
        // Example: Match Cognito default policy (min 8 chars)
        if (password.length < 8) {
             setError("Password must be at least 8 characters long.");
             setIsLoading(false);
             return;
        }
        // Add more complex regex checks if needed

        try {
            const { isSignUpComplete, userId, nextStep } = await signUp({
                username: email, // Use email as the Cognito username
                password: password,
                options: {
                    userAttributes: {
                        email: email, // Pass email as an attribute as well
                        // Add other standard or custom attributes here if needed
                        // e.g., 'preferred_username': someOtherUsername collected from form
                    },
                    // Auto sign in after successful sign up (optional, requires confirmation first)
                    // autoSignIn: { enabled: true }
                }
            });

            console.log("Sign up result:", { isSignUpComplete, userId, nextStep });

            if (isSignUpComplete) {
                // This usually only happens if email/phone verification is turned OFF in Cognito
                console.log("Signup complete and auto-verified.");
                router.push('/profile'); // Or wherever logged-in users go
            } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
                console.log("Signup successful, confirmation required.");
                // Redirect to confirmation page, passing email as username
                router.push(`/confirm-signup?email=${encodeURIComponent(email)}`);
            } else {
                 // Handle other potential next steps if applicable
                 setError(`Unhandled sign up step: ${nextStep.signUpStep}`);
                 console.error("Unhandled sign up step:", nextStep);
            }

        } catch (err: unknown) { // Use unknown instead of any
            console.error('Error signing up:', err);
            // Type check and handle specific Amplify error names
            if (err instanceof Error) {
                 if (err.name === 'UsernameExistsException') {
                     setError('An account with this email already exists.');
                 } else if (err.message?.includes('password policy') || err.name === 'InvalidPasswordException') {
                     setError('Password does not meet the requirements (check length, complexity).');
                 } else if (err.name === 'InvalidParameterException') {
                      setError('Invalid input provided (e.g., email format). Please check your details.');
                 }
                 else {
                     setError(err.message || 'Sign up failed. Please try again.');
                 }
            } else {
                 setError('An unknown error occurred during sign up.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Create Account</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                    {/* Removed optional Username field for simplicity */}
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" disabled={isLoading} />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="********" disabled={isLoading} />
                         {/* Display password requirements based on your Cognito policy */}
                         <p className="text-xs text-gray-500 mt-1">Min. 8 characters. Consider adding complexity requirements.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" legacyBehavior><a className="font-medium text-blue-600 hover:text-blue-500">Login</a></Link>
                </p>
            </div>
        </div>
    );
}

