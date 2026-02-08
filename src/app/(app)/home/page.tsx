'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function HomeContent() {
    const searchParams = useSearchParams();
    const [isGuest, setIsGuest] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Check if guest param is in URL
        const guestParam = searchParams.get('guest');
        if (guestParam === 'true') {
            localStorage.setItem('evasion_guest_mode', 'true');
            setIsGuest(true);
            setUserName('Guest');
        } else {
            // Check localStorage for guest mode
            const storedGuest = localStorage.getItem('evasion_guest_mode');
            if (storedGuest === 'true') {
                setIsGuest(true);
                setUserName('Guest');
            } else {
                // In real app, would get from auth context
                setUserName('Alex');
            }
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col">

            {/* Greeting */}
            <div className="px-4 pt-6 pb-4">
                <h2 className="text-[#F5F5F4] text-3xl font-bold tracking-tight">
                    {(() => {
                        const hour = new Date().getHours();
                        if (isGuest) return "Hey, Guest";

                        // Dev/User Greeting (Julian)
                        const name = userName || "Julian";

                        if (hour >= 6 && hour < 12) return `Good morning, ${name}`;
                        if (hour >= 12 && hour < 18) return `Good afternoon, ${name}`;
                        return `Good evening, ${name}`;
                    })()}
                </h2>
                <p className="text-[#A8A8A8] text-sm mt-1">
                    {isGuest
                        ? 'Sign up to save your drives!'
                        : (() => {
                            const hour = new Date().getHours();
                            if (hour >= 6 && hour < 12) return "Ready to hit the road?";
                            if (hour >= 12 && hour < 18) return "Perfect time for a drive.";
                            return "The streets are calling.";
                        })()
                    }
                </p>
            </div>

            {/* Expanded Stats Grid - High Contrast Numbers */}
            <div className="px-4 pb-2">
                <h3 className="text-[#F5F5F4] text-sm font-bold mb-3 uppercase tracking-wider opacity-80">Overview</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <StatCard
                        label="Total Miles"
                        value="1,240"
                        icon="distance"
                        color="text-[#FDBA74]" // Orange-tan
                    />
                    <StatCard
                        label="Top Speed"
                        value="142"
                        unit="mph"
                        icon="speed"
                        color="text-[#F9A8D4]" // Light pink
                    />
                    <StatCard
                        label="Total Drives"
                        value="42"
                        icon="route"
                        color="text-[#A7F3D0]" // Light green
                    />
                    <StatCard
                        label="Drive Time"
                        value="34.5"
                        unit="h"
                        icon="schedule"
                        color="text-[#BAE6FD]" // Light blue
                    />
                </div>
                {/* Secondary Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <MiniStatCard label="Avg Speed" value="48" unit="mph" />
                    <MiniStatCard label="Night Drives" value="28" />
                    <MiniStatCard label="Violations" value="0" color="text-emerald-400" />
                </div>
            </div>

            {/* Heatmap Placeholder */}
            <div className="px-4 mb-6">
                <h3 className="text-[#F5F5F4] text-sm font-bold mb-3 uppercase tracking-wider opacity-80">Activity Heatmap</h3>
                <div className="bg-[#0D0B14] border border-white/5 rounded-xl p-4 h-48 relative overflow-hidden group">
                    {/* Mock Heatmap Visual */}
                    <div className="absolute inset-0 opacity-40">
                        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <radialGradient id="heat1" cx="0.2" cy="0.4" r="0.3">
                                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="heat2" cx="0.7" cy="0.6" r="0.4">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="heat3" cx="0.5" cy="0.3" r="0.25">
                                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            <rect width="100%" height="100%" fill="#0D0B14" />
                            <rect width="100%" height="100%" fill="url(#heat1)" />
                            <rect width="100%" height="100%" fill="url(#heat2)" />
                            <rect width="100%" height="100%" fill="url(#heat3)" />
                            {/* Grid lines */}
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col justify-end h-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-xs text-slate-400">High Activity</span>
                        </div>
                        <p className="text-white font-medium text-sm">Los Angeles, CA</p>
                    </div>

                    {/* Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <button className="bg-[#8B5CF6] text-white px-4 py-2 rounded-full text-xs font-bold">
                            View Full Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="px-4 pb-24">
                <div className="flex items-center justify-between pb-4">
                    <h3 className="text-[#F5F5F4] text-lg font-bold">Recent Activity</h3>
                    <Link href="/drives" className="text-[#8B5CF6] text-sm font-semibold hover:text-[#7C4FE0] transition-colors">
                        View All
                    </Link>
                </div>

                <div className="flex flex-col gap-3">
                    <ActivityCard
                        title="Canyon Run"
                        location="Mulholland Highway"
                        distance="12.4 mi"
                        time="18m 42s"
                        rating={4.8}
                    />
                    <ActivityCard
                        title="Midnight Sprint"
                        location="Downtown Tunnel Loop"
                        distance="5.2 mi"
                        time="6m 15s"
                        rating={4.2}
                    />
                    <ActivityCard
                        title="Coastal Cruise"
                        location="PCH Northbound"
                        distance="34.1 mi"
                        time="45m 10s"
                        rating={5.0}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    unit,
    icon,
    color = "text-[#F5F5F4]"
}: {
    label: string;
    value: string;
    unit?: string;
    icon: string;
    color?: string;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-[#0D0B14] border border-[rgba(255,255,255,0.05)] shadow-sm hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-[#A8A8A8] text-[10px] font-bold uppercase tracking-wider">{label}</p>
                <span className="material-symbols-outlined text-[#8B5CF6] text-lg opacity-80">{icon}</span>
            </div>
            <div className="flex items-baseline">
                <p className={`${color} text-3xl font-black tracking-tight leading-none`}>
                    {value}
                </p>
                {unit && <span className="text-xs font-bold text-[#A8A8A8] ml-1">{unit}</span>}
            </div>
        </div>
    );
}

function MiniStatCard({
    label,
    value,
    unit,
    color = "text-[#F5F5F4]"
}: {
    label: string;
    value: string;
    unit?: string;
    color?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl p-3 bg-[#0D0B14] border border-[rgba(255,255,255,0.05)]">
            <p className={`${color} text-lg font-bold leading-none`}>
                {value}<span className="text-[10px] ml-0.5 text-[#A8A8A8] font-normal">{unit}</span>
            </p>
            <p className="text-[#52525B] text-[9px] font-bold uppercase tracking-widest">{label}</p>
        </div>
    )
}

function ActivityCard({
    title,
    location,
    distance,
    time,
    rating,
}: {
    title: string;
    location: string;
    distance: string;
    time: string;
    rating: number;
}) {
    return (
        <div className="flex items-center gap-4 bg-[#0D0B14] p-3 rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[#8B5CF6]/30 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#18181B] flex-shrink-0 flex items-center justify-center relative">
                {/* Map Placeholder Image */}
                <div
                    className="absolute inset-0 opacity-50 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                    style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-118.4,34.1,12/400x400?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsYnJ2am0wM2w5MnJwaXEzM3Z5YmJzIn0.V88-1_9-8733358')` }} // Placeholder URL, won't load but gives texture
                />
                <span className="material-symbols-outlined text-[#8B5CF6] text-2xl relative z-10">map</span>
            </div>
            <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold text-sm group-hover:text-[#8B5CF6] transition-colors">{title}</h4>
                    <div className="flex items-center gap-1 bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">
                        <span
                            className="material-symbols-outlined text-[#8B5CF6] text-[10px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            star
                        </span>
                        <span className="text-[#8B5CF6] text-[10px] font-bold">{rating}</span>
                    </div>
                </div>
                <p className="text-[#71717A] text-xs mt-0.5">{location}</p>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#71717A] text-xs">straighten</span>
                        <span className="text-[#A1A1AA] text-xs font-medium">{distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#71717A] text-xs">timer</span>
                        <span className="text-[#A1A1AA] text-xs font-medium">{time}</span>
                    </div>
                </div>
            </div>
            <span className="material-symbols-outlined text-[#52525B] group-hover:text-white transition-colors">chevron_right</span>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full" />
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
