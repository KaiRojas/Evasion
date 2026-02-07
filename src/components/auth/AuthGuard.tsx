'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/legal/terms', '/legal/privacy'];
const AUTH_ROUTES = ['/login', '/signup', '/onboarding', '/forgot-password'];

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (isLoading) return;

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
        const isAuthRoute = AUTH_ROUTES.includes(pathname);

        // If on auth route and already logged in, redirect to home
        if (isAuthRoute && isAuthenticated) {
            router.replace('/home');
            return;
        }

        // If on protected route and not authenticated, redirect to login
        if (!isPublicRoute && !isAuthRoute && !isAuthenticated) {
            router.replace('/login');
            return;
        }

        setIsChecking(false);
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading state while checking auth
    if (isLoading || isChecking) {
        return (
            <div className="fixed inset-0 bg-[#06040A] flex items-center justify-center z-[9999]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

