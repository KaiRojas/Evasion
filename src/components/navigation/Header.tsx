'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Mail, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    showBackButton?: boolean;
    rightContent?: React.ReactNode;
}

export function Header({ showBackButton = false, rightContent }: HeaderProps) {
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotifyOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notifications = [
        {
            id: 1,
            title: 'Notification 1',
            message: 'This is a placeholder for the first notification.',
            time: 'Just now'
        },
        {
            id: 2,
            title: 'Notification 2',
            message: 'This is a placeholder for the second notification.',
            time: '10m ago'
        },
        {
            id: 3,
            title: 'Notification 3',
            message: 'This is a placeholder for the third notification.',
            time: '1h ago'
        }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-[#030205]/95 backdrop-blur-xl border-b border-white/5"></div>

            <div className="relative z-10 flex items-center justify-between px-4 h-[52px] max-w-md mx-auto">
                {/* Left: Glitch Logo Image */}
                <div className="flex items-center">
                    <Link href="/home" className="flex items-center hover:opacity-90 transition-opacity">
                        <img
                            src="/images/evasion-logo-glitch.png"
                            alt="EVASION"
                            className="h-24 w-auto object-contain -ml-2 -mt-1"
                        />
                    </Link>
                </div>

                {/* Right: Notification Toggle */}
                <div className="flex items-center justify-center relative" ref={dropdownRef}>
                    {rightContent ?? (
                        <>
                            <button
                                onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                                className={cn(
                                    "relative p-2 rounded-full transition-all duration-200",
                                    isNotifyOpen ? "bg-white/10 text-white" : "hover:bg-white/5 text-[#F5F5F4]"
                                )}
                            >
                                <Mail size={20} />
                                {/* Notification badge dot */}
                                {!isNotifyOpen && (
                                    <div className="absolute top-1 right-1 size-2 bg-[#EF4444] rounded-full border border-[#030205]" />
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isNotifyOpen && (
                                <div className="absolute top-[calc(100%+12px)] right-0 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 origin-top-right">
                                    <div className="p-3 border-b border-zinc-800 bg-zinc-900/50">
                                        <h3 className="text-xs font-bold text-white">Notifications</h3>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto py-1">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-zinc-800/50 last:border-0 group cursor-pointer">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[10px] font-bold text-zinc-300">{n.title}</span>
                                                    <span className="text-[9px] text-zinc-500">{n.time}</span>
                                                </div>
                                                <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                                    {n.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/notifications"
                                        onClick={() => setIsNotifyOpen(false)}
                                        className="block p-3 text-center text-[10px] font-bold text-[#8B5CF6] hover:bg-white/5 transition-colors border-t border-zinc-800"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
