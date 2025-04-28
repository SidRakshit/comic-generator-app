// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { isSignedIn, nextStep } = await signIn({
                username: email, // Cognito uses 'username' which is the email in our setup
                password: password,
            });

            console.log("Sign in result:", { isSignedIn, nextStep });

            if (isSignedIn) {                
                console.log("Login successful, redirecting...");
                router.push('/profile');
            } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {                 
                 console.log("User needs to confirm sign up.");                 
                 router.push(`/confirm-signup?email=${encodeURIComponent(email)}`);
            } else if (nextStep.signInStep === 'RESET_PASSWORD') {
                 setError("You need to reset your password.");                 
            } else {                 
                 setError(`Unhandled sign-in step: ${nextStep.signInStep}`);
            }

        } catch (err: unknown) {
            console.error('Error signing in:', err);
            if (err instanceof Error) {
                 if (err.name === 'UserNotFoundException' || err.name === 'NotAuthorizedException') {
                     setError('Invalid email or password.');
                 } else {
                    setError(err.message || 'Login failed. Please check your credentials.');
                 }
            } else {
                 setError('An unknown error occurred during login.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
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
                        <Label htmlFor="password">Password</Label>
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
                    {/* Add Forgot Password link if implemented */}
                    {/* <div className="text-sm text-right">
                        <Link href="/forgot-password" legacyBehavior><a className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a></Link>
                    </div> */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" legacyBehavior><a className="font-medium text-blue-600 hover:text-blue-500">Sign up</a></Link>
                </p>
            </div>
        </div>
    );
}
