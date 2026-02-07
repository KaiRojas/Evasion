'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks';

export default function AuthLandingPage() {
    const { loginAsGuest } = useAuth();

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Background Image with Gradient Overlay */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4TvIz858XyzdwWD8JzwHE7P1rAG-ko8VQGdx_9KOjCZRUDn7zPX7T1-r2d-UT4z272JkI17GM7_zYMnDL2dFA-Cs_lpJ2-oGIMLZ-GOzmClEkC6KTrj0CJFBzO4Z5kscRNWSrKgyWdP6ECpc-C9SWs4kG35XCQhV9zfio5TZrB4JWEcYdOXJs_z1OZvC8OvVsoc215Dd7YQrIdchEtVxM07dbhUaIbNFjesrLpf4jqgGYpYiCI9pTg-UCavIemPzu1vbRNnTvfFw"
                    alt="Sports car environment"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-[430px] mx-auto px-8">
                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center pt-24">
                    <img
                        src="/images/evasion-logo.png"
                        alt="EVASION"
                        className="h-32 w-auto mb-2"
                    />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Auth Buttons */}
                <div className="flex flex-col gap-3.5 mb-24">
                    {/* Email Sign Up */}
                    <Link
                        href="/signup"
                        className="flex w-full items-center justify-center rounded-full h-12 text-xs font-bold tracking-[0.1em] uppercase transition-all active:scale-[0.98] bg-[#8B5CF6] text-white hover:brightness-110 shadow-lg shadow-[#8B5CF6]/20"
                    >
                        Sign up with email
                    </Link>

                    {/* Apple Sign In */}
                    <button className="flex w-full items-center justify-center rounded-full h-12 text-xs font-bold tracking-[0.1em] uppercase transition-all active:scale-[0.98] border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white/10">
                        <div className="w-5 h-5 mr-3 flex items-center justify-center">
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                        </div>
                        Sign in with Apple
                    </button>

                    {/* Google Sign In */}
                    <button className="flex w-full items-center justify-center rounded-full h-12 text-xs font-bold tracking-[0.1em] uppercase transition-all active:scale-[0.98] border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white/10">
                        <div className="w-5 h-5 mr-3 flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </div>
                        Sign in with Google
                    </button>
                    {/* Login Link */}
                    <div className="flex flex-col items-center justify-center mt-6">
                        <p className="text-[#A8A8A8] text-[10px] font-medium tracking-[0.2em] uppercase">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-white font-bold hover:text-[#8B5CF6] transition-colors ml-1 border-b border-white/20 pb-0.5"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Continue as Guest */}
                <div className="flex flex-col items-center justify-center pb-10">
                    <button
                        onClick={loginAsGuest}
                        className="text-[#A8A8A8] text-[10px] font-medium tracking-[0.2em] uppercase hover:text-white transition-colors"
                    >
                        Continue as guest
                    </button>
                </div>
            </div>
        </div>
    );
}
