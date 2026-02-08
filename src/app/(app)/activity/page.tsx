'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ActivityType = 'all' | 'drives' | 'garage' | 'social';

const ACTIVITIES = [
    {
        id: 'a1',
        type: 'drives',
        title: 'Completed Cannonball Run',
        meta: '2,800 mi • Avg 78 mph',
        time: 'Today',
        icon: 'route',
        accent: '#8B5CF6'
    },
    {
        id: 'a2',
        type: 'garage',
        title: 'Added Rivian R1T',
        meta: 'Quad-Motor • 835 hp',
        time: 'Yesterday',
        icon: 'garage',
        accent: '#22C55E'
    },
    {
        id: 'a3',
        type: 'drives',
        title: 'New PR: 0–60 mph',
        meta: '3.2s • 0.4s faster',
        time: '2 days ago',
        icon: 'bolt',
        accent: '#F59E0B'
    },
    {
        id: 'a4',
        type: 'social',
        title: 'Followed by @midnight_cruiser',
        meta: 'Tap to view profile',
        time: '3 days ago',
        icon: 'person_add',
        accent: '#60A5FA'
    },
    {
        id: 'a5',
        type: 'drives',
        title: 'Route published: Angeles Crest',
        meta: '66.0 mi • 1h 30m',
        time: 'Last week',
        icon: 'public',
        accent: '#A855F7'
    }
];

export default function ActivityPage() {
    const [activeTab, setActiveTab] = useState<ActivityType>('all');

    const filtered = activeTab === 'all'
        ? ACTIVITIES
        : ACTIVITIES.filter(activity => activity.type === activeTab);

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4] pb-24">
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/profile" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold">Activity</h1>
                    <div className="size-10" />
                </div>
            </header>

            <div className="px-4 pt-4">
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'drives', label: 'Drives' },
                        { key: 'garage', label: 'Garage' },
                        { key: 'social', label: 'Social' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as ActivityType)}
                            className={cn(
                                'rounded-full border px-2 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors',
                                activeTab === tab.key
                                    ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30'
                                    : 'border-white/10 text-white/50 hover:text-white'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 py-6 space-y-3">
                {filtered.map(activity => (
                    <div key={activity.id} className="bg-[#0D0B14] rounded-xl border border-white/5 p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${activity.accent}22` }}>
                                <span className="material-symbols-outlined text-sm" style={{ color: activity.accent }}>{activity.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-white font-medium">{activity.title}</p>
                                <p className="text-xs text-slate-500">{activity.meta}</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
