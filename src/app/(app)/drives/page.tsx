'use client';

import Link from 'next/link';
import { useState } from 'react';

type Tab = 'my-drives' | 'published';

export default function DrivesPage() {
    const [activeTab, setActiveTab] = useState<Tab>('my-drives');

    return (
        <div className="flex flex-col pb-24">
            {/* Tab Bar */}
            <div className="sticky top-0 z-30 bg-[#06040A]/95 backdrop-blur-md border-b border-[rgba(139,92,246,0.1)] px-4">
                <div className="flex gap-8 justify-center">
                    <button
                        onClick={() => setActiveTab('my-drives')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-4 transition-colors ${activeTab === 'my-drives'
                            ? 'border-[#8B5CF6] text-[#F5F5F4]'
                            : 'border-transparent text-[#A8A8A8] hover:text-[#F5F5F4]'
                            }`}
                    >
                        <span className="text-sm font-bold tracking-wide uppercase">My Drives</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-4 transition-colors ${activeTab === 'published'
                            ? 'border-[#8B5CF6] text-[#F5F5F4]'
                            : 'border-transparent text-[#A8A8A8] hover:text-[#F5F5F4]'
                            }`}
                    >
                        <span className="text-sm font-bold tracking-wide uppercase">Published</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col p-4 gap-4 min-h-screen">
                {activeTab === 'my-drives' && <MyDrivesView />}
                {activeTab === 'published' && <PublishedView />}
            </div>
        </div>
    );
}

// --- Views ---

function MyDrivesView() {
    return (
        <div className="flex flex-col gap-4">
            <DriveCard
                name="Midnight Loop - Mulholland"
                date="Yesterday, 11:42 PM"
                distance="12.4 mi"
                time="45m 12s"
                score={98}
                privacy="Private"
            />
            <DriveCard
                name="PCH Cruise"
                date="Oct 24, 6:30 PM"
                distance="34.2 mi"
                time="1h 12m"
                score={92}
                privacy="Shared"
            />
            <DriveCard
                name="Canyon Run"
                date="Oct 20, 10:15 PM"
                distance="8.1 mi"
                time="24m 05s"
                score={85}
                privacy="Private"
            />
        </div>
    );
}

function PublishedView() {
    return (
        <div className="flex flex-col gap-4">
            <div className="bg-[#0D0B14] rounded-xl p-6 text-center border border-[rgba(255,255,255,0.05)] mb-2">
                <span className="material-symbols-outlined text-[#8B5CF6] text-4xl mb-2">public</span>
                <h3 className="text-white font-bold mb-1">Share Your Routes</h3>
                <p className="text-[#A8A8A8] text-sm mb-4">
                    Publish your best drives to the community.
                </p>
                <button className="bg-[#8B5CF6] text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition-all">
                    Create Route
                </button>
            </div>

            <DropdownSection title="Public Routes" defaultOpen>
                <DriveCard
                    name="Midnight Loop - Mulholland"
                    date="By @drift_king"
                    distance="12.4 mi"
                    time="45m"
                    score={98}
                    privacy="Public"
                    likes={842}
                />
                <DriveCard
                    name="Angeles Crest Highway"
                    date="By @touge_master"
                    distance="45.2 mi"
                    time="1h 20m"
                    score={95}
                    privacy="Public"
                    likes="1.2k"
                />
            </DropdownSection>

            <DropdownSection title="My Published Routes">
                <DriveCard
                    name="PCH Cruise"
                    date="Published Oct 25"
                    distance="34.2 mi"
                    time="1h 12m"
                    score={92}
                    privacy="Public"
                    likes={124}
                />
            </DropdownSection>
        </div>
    );
}

function DropdownSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="flex flex-col">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between py-3 px-2 text-[#A8A8A8] hover:text-white transition-colors"
            >
                <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
                <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                </span>
            </button>

            <div className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
}

// --- Components ---

function DriveCard({ name, date, distance, time, score, privacy, likes }: any) {
    return (
        <div className="bg-[#0D0B14] rounded-xl border border-[rgba(255,255,255,0.05)] overflow-hidden hover:border-[rgba(139,92,246,0.3)] transition-colors cursor-pointer group">
            <div className="aspect-[2/1] bg-[#1A1820] relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2A2830] text-6xl">map</span>

                {/* Score Badge */}
                <div className="absolute top-3 right-3 bg-[#06040A]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center gap-1.5">
                    <span className="text-[10px] text-[#A8A8A8] font-bold uppercase">Score</span>
                    <span className={`text-sm font-bold ${score >= 90 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
                        {score}
                    </span>
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-3 left-3 bg-[#06040A]/80 backdrop-blur-md size-8 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#A8A8A8] text-xs">
                        {privacy === 'Private' ? 'lock' : privacy === 'Shared' ? 'group' : 'public'}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-bold text-sm tracking-wide">{name}</h3>
                    {likes && (
                        <div className="flex items-center gap-1 text-[#A8A8A8]">
                            <span className="material-symbols-outlined text-xs">favorite</span>
                            <span className="text-xs font-medium">{likes}</span>
                        </div>
                    )}
                </div>
                <p className="text-[#A8A8A8] text-xs mb-3">{date}</p>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#8B5CF6] text-sm">distance</span>
                        <span className="text-[#F5F5F4] text-xs font-medium">{distance}</span>
                    </div>
                    <div className="w-px h-3 bg-[rgba(255,255,255,0.1)]" />
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#8B5CF6] text-sm">schedule</span>
                        <span className="text-[#F5F5F4] text-xs font-medium">{time}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
