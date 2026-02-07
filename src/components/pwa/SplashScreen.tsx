'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Start fade out after 2 seconds
        const timer = setTimeout(() => {
            setIsAnimating(true);
            setTimeout(() => setIsVisible(false), 800);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[999] bg-[#06040A] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out",
            isAnimating ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
        )}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]" />

            <div className="relative flex flex-col items-center">
                {/* Logo with Glitch Effect placeholder or Pulsing */}
                <div className="relative">
                    <div className="absolute -inset-12 bg-[#8B5CF6] blur-3xl opacity-30 animate-pulse" />
                    <img
                        src="/images/evasion-logo.png"
                        alt="EVASION"
                        className="h-40 w-auto relative z-10 animate-in fade-in zoom-in duration-1000 animate-pulse"
                    />
                </div>

                {/* Progress Bar */}
                <div className="w-56 h-1 mt-12 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent animate-shimmer" />
                    <div className="h-full bg-[#8B5CF6] transition-all duration-[2000ms] w-full origin-left" />
                </div>
            </div>
        </div>
    );
}
