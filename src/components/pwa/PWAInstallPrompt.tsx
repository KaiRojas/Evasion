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
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a0a] text-[#F5F5F4] overflow-x-hidden animate-in fade-in duration-500 font-[family-name:var(--font-space)]">
            <style jsx>{`
                .ambient-glow {
                    background: radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.2) 0%, rgba(10, 10, 10, 0) 70%);
                }
                .bottom-glow {
                    background: radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.15) 0%, rgba(10, 10, 10, 0) 60%);
                }
                .pill-container {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 2rem;
                    border: 1px solid rgba(139, 92, 246, 0.1);
                }
                .glitch-wordmark {
                    position: relative;
                    display: inline-block;
                    font-style: italic;
                    letter-spacing: 0.4em;
                    font-weight: 800;
                    color: #ffffff;
                    text-transform: uppercase;
                }
                .glitch-wordmark::before,
                .glitch-wordmark::after {
                    content: "EVASION";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.8;
                }
                .glitch-wordmark::before {
                    color: #8b5cf6;
                    z-index: -1;
                    transform: translate(-2px, 1px) skew(-5deg);
                    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
                }
                .glitch-wordmark::after {
                    color: #d8b4fe;
                    z-index: -2;
                    transform: translate(2px, -1px) skew(5deg);
                    clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
                }
                .scanline {
                    position: absolute;
                    height: 1px;
                    width: 120%;
                    left: -10%;
                    background: rgba(139, 92, 246, 0.4);
                    box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
                    top: 50%;
                }
            `}</style>

            <div className="ambient-glow absolute inset-0 pointer-events-none"></div>
            <div className="bottom-glow absolute inset-0 pointer-events-none"></div>

            <div className="relative flex h-full min-h-screen w-full flex-col z-10">
                <div className="flex items-center p-8 pb-4 justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-[#8b5cf6] blur-2xl opacity-20"></div>
                        <div className="glitch-wordmark text-2xl">
                            EVASION
                            <div className="scanline"></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center px-6 pt-6 pb-8">
                    <h2 className="text-[#F5F5F4] tracking-tight text-[32px] font-bold leading-tight text-center">Install App</h2>
                    <p className="text-zinc-400 text-base font-normal leading-normal pt-2 text-center max-w-[280px]">Follow these steps to add EVASION to your home screen</p>
                </div>

                <div className="flex-grow px-6 py-2">
                    <div className="space-y-4">
                        {isIOS ? (
                            <>
                                <div className="pill-container p-4 flex items-center gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">1</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">Tap the <span className="material-symbols-outlined text-[#8b5cf6] text-lg align-middle leading-none">more_horiz</span> menu</p>
                                        </div>
                                        <p className="text-zinc-500 text-xs">Found in the bottom right corner</p>
                                    </div>
                                </div>
                                <div className="pill-container p-4 flex items-center gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">2</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">Tap Share <span className="material-symbols-outlined text-[#8b5cf6] text-lg align-middle leading-none">ios_share</span></p>
                                        </div>
                                        <p className="text-zinc-500 text-xs">At the top of the popup</p>
                                    </div>
                                </div>
                                <div className="pill-container p-4 flex items-center gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">3</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">Tap "Add to Home Screen" <span className="material-symbols-outlined text-[#8b5cf6] text-lg align-middle leading-none">add_box</span></p>
                                        </div>
                                        <p className="text-zinc-500 text-xs">Scroll down in the menu</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Chrome / Desktop Steps */}
                                <div className="pill-container p-4 flex items-center gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">1</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">Click the <span className="material-symbols-outlined text-[#8b5cf6] text-lg align-middle leading-none">install_mobile</span> icon</p>
                                        </div>
                                        <p className="text-zinc-500 text-xs">Found in the address bar</p>
                                    </div>
                                </div>
                                <div className="pill-container p-4 flex items-center gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">2</div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#F5F5F4] text-base font-medium">Click "Install"</p>
                                        </div>
                                        <p className="text-zinc-500 text-xs">Confirm the installation prompt</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-6 py-12 flex flex-col items-center mt-auto">
                    <div className="flex items-center justify-center mb-16">
                        <div className="relative">
                            <div className="absolute -inset-12 bg-[#8b5cf6]/30 blur-3xl rounded-full opacity-60"></div>
                            <span className="material-symbols-outlined text-[#8b5cf6] text-8xl font-light relative z-10">more_horiz</span>
                        </div>
                    </div>
                    <div className="pb-8">
                        <button
                            onClick={handleDismiss}
                            className="text-gray-500 text-sm font-medium hover:text-[#F5F5F4] transition-colors underline underline-offset-4 decoration-gray-800"
                        >
                            I'll do it later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
