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
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#06040A] text-[#F5F5F4] overflow-x-hidden animate-in fade-in duration-500">
            {/* Ambient Dynamic Island Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[40px] bg-[#8B5CF6]/30 blur-[40px] rounded-full" />

            {/* Content */}
            <div className="relative flex h-full min-h-screen w-full flex-col z-10">
                {/* Wordmark */}
                <div className="flex items-center p-8 pb-4 justify-center">
                    <div className="relative group">
                        <div className="absolute -inset-8 bg-[#8B5CF6] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                        <img
                            src="/images/evasion-logo.png"
                            alt="EVASION"
                            className="h-12 w-auto relative animate-in slide-in-from-top-4 duration-700"
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="flex flex-col items-center px-6 pt-4 pb-10">
                    <h2 className="text-[#F5F5F4] tracking-tight text-[32px] font-black italic uppercase leading-tight text-center">
                        Initialize Tactical App
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] pt-3 text-center border-b border-[#8B5CF6]/20 pb-2">
                        Deployment Phase: Local Installation
                    </p>
                </div>

                {/* Steps */}
                <div className="flex-grow px-8 py-2">
                    <div className="space-y-4">
                        {isIOS ? (
                            <>
                                {/* iOS Safari Steps */}
                                <div className="p-5 flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-black italic text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">01</div>
                                    <div className="flex flex-col">
                                        <p className="text-[#F5F5F4] text-xs font-black uppercase tracking-wider italic">
                                            Engage <span className="text-[#8B5CF6]">Safari Menu</span>
                                        </p>
                                        <p className="text-zinc-500 text-[10px] font-bold mt-1">Found in the global navigation bar</p>
                                    </div>
                                </div>

                                <div className="p-5 flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-black italic text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">02</div>
                                    <div className="flex flex-col">
                                        <p className="text-[#F5F5F4] text-xs font-black uppercase tracking-wider italic">
                                            Select <span className="text-[#8B5CF6]">Share Action</span>
                                        </p>
                                        <p className="text-zinc-500 text-[10px] font-bold mt-1">Locate the external export icon</p>
                                    </div>
                                </div>

                                <div className="p-5 flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-black italic text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">03</div>
                                    <div className="flex flex-col">
                                        <p className="text-[#F5F5F4] text-xs font-black uppercase tracking-wider italic">
                                            <span className="text-[#8B5CF6]">Add to Home Screen</span>
                                        </p>
                                        <p className="text-zinc-500 text-[10px] font-bold mt-1">Finalize local integration</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Chrome / Desktop Steps */}
                                <div className="p-5 flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-black italic text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">01</div>
                                    <div className="flex flex-col">
                                        <p className="text-[#F5F5F4] text-xs font-black uppercase tracking-wider italic">
                                            Detect <span className="text-[#8B5CF6]">Install Target</span>
                                        </p>
                                        <p className="text-zinc-500 text-[10px] font-bold mt-1">Look for the install icon in address bar</p>
                                    </div>
                                </div>

                                <div className="p-5 flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-black italic text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">02</div>
                                    <div className="flex flex-col">
                                        <p className="text-[#F5F5F4] text-xs font-black uppercase tracking-wider italic">
                                            Execute <span className="text-[#8B5CF6]">Installation</span>
                                        </p>
                                        <p className="text-zinc-500 text-[10px] font-bold mt-1">Confirm and authorize deployment</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-8 pb-12 flex flex-col items-center mt-auto">
                    <button
                        onClick={handleDismiss}
                        className="group flex flex-col items-center gap-2"
                    >
                        <span className="text-[#8B5CF6] text-[10px] font-black uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all duration-300">
                            Skip Deployment
                        </span>
                        <div className="w-8 h-0.5 bg-zinc-800 group-hover:bg-[#8B5CF6] group-hover:w-12 transition-all duration-300" />
                    </button>
                    <p className="mt-6 text-[8px] text-zinc-700 font-bold uppercase tracking-widest text-center">
                        Application version: 2.1.0-STABLE | tactical overlay: active
                    </p>
                </div>
            </div>
        </div>
    );
}
