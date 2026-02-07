'use client';

import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true); // Default true to prevent flash

    useEffect(() => {
        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
        setIsIOS(iOS);

        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsStandalone(standalone);

        // If already installed, never show
        if (standalone) {
            return;
        }

        // Check if user has dismissed before
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (!dismissed) {
            // Delay showing prompt by 1.5 seconds
            const timer = setTimeout(() => setShowPrompt(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    // Don't show if installed or dismissed
    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] text-[#F5F5F4] overflow-x-hidden">
            {/* Ambient Glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.2) 0%, rgba(10, 10, 10, 0) 70%)' }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.15) 0%, rgba(10, 10, 10, 0) 60%)' }}
            />

            {/* Content */}
            <div className="relative flex h-full min-h-screen w-full flex-col z-10">
                {/* Wordmark */}
                <div className="flex items-center p-8 pb-4 justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-[#8B5CF6] blur-2xl opacity-20" />
                        <img
                            src="/images/evasion-logo.png"
                            alt="EVASION"
                            className="h-12 w-auto relative"
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="flex flex-col items-center px-6 pt-6 pb-8">
                    <h2 className="text-[#F5F5F4] tracking-tight text-[32px] font-bold leading-tight text-center">
                        Install App
                    </h2>
                    <p className="text-gray-400 text-base font-normal leading-normal pt-2 text-center max-w-[280px]">
                        Follow these steps to add EVASION to your home screen
                    </p>
                </div>

                {/* Steps */}
                <div className="flex-grow px-6 py-2">
                    <div className="space-y-4">
                        {isIOS ? (
                            <>
                                {/* iOS Safari Steps */}
                                <div className="p-4 flex items-center gap-4 rounded-2xl border border-[rgba(139,92,246,0.1)] bg-white/[0.03]">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">1</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">
                                                Tap the <span className="material-symbols-outlined text-[#8B5CF6] text-lg align-middle leading-none">more_horiz</span> menu
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-xs">Found in the bottom right corner</p>
                                    </div>
                                </div>

                                <div className="p-4 flex items-center gap-4 rounded-2xl border border-[rgba(139,92,246,0.1)] bg-white/[0.03]">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">2</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">
                                                Tap Share <span className="material-symbols-outlined text-[#8B5CF6] text-lg align-middle leading-none">ios_share</span>
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-xs">At the top of the popup</p>
                                    </div>
                                </div>

                                <div className="p-4 flex items-center gap-4 rounded-2xl border border-[rgba(139,92,246,0.1)] bg-white/[0.03]">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">3</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">
                                                Tap &quot;Add to Home Screen&quot; <span className="material-symbols-outlined text-[#8B5CF6] text-lg align-middle leading-none">add_box</span>
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-xs">Scroll down in the menu</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Chrome / Desktop Steps */}
                                <div className="p-4 flex items-center gap-4 rounded-2xl border border-[rgba(139,92,246,0.1)] bg-white/[0.03]">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">1</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">
                                                Click <span className="material-symbols-outlined text-[#8B5CF6] text-lg align-middle leading-none">install_desktop</span> in address bar
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-xs">Or use browser menu → Install app</p>
                                    </div>
                                </div>

                                <div className="p-4 flex items-center gap-4 rounded-2xl border border-[rgba(139,92,246,0.1)] bg-white/[0.03]">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">2</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">
                                                Click &quot;Install&quot; in the popup
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-xs">Confirm to add EVASION to your device</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Large Icon + Dismiss */}
                <div className="px-6 py-12 flex flex-col items-center mt-auto">
                    <div className="flex items-center justify-center mb-16">
                        <div className="relative">
                            <div className="absolute -inset-12 bg-[#8B5CF6]/30 blur-3xl rounded-full opacity-60" />
                            <span className="material-symbols-outlined text-[#8B5CF6] text-8xl font-light relative z-10">
                                {isIOS ? 'more_horiz' : 'install_desktop'}
                            </span>
                        </div>
                    </div>

                    <div className="pb-8">
                        <button
                            onClick={handleDismiss}
                            className="text-gray-500 text-sm font-medium hover:text-[#F5F5F4] transition-colors underline underline-offset-4 decoration-gray-800"
                        >
                            I&apos;ll do it later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
