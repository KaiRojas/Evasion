'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Helper to determine active state.
    // Logic: /home is Stats, /home/news is News, /home/analytics is Analytics.
    const isAnalytics = pathname.includes('/analytics');
    const isNews = pathname.includes('/news');
    const isStats = !isNews && !isAnalytics;

    return (
        <div className="flex flex-col min-h-full">
            {/* Tab Bar */}
            <div className="px-5 border-b border-[rgba(139,92,246,0.1)] py-2 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 justify-center">
                    <Link
                        href="/home"
                        className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${isStats
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]">My Stats</span>
                    </Link>
                    <Link
                        href="/home/news"
                        className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${isNews
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]">News</span>
                    </Link>
                    <Link
                        href="/home/analytics"
                        className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${isAnalytics
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Analytics</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
