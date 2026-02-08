'use client';

import { useState } from 'react';
import { MapProvider, BaseMap, RouteLayer } from '@/components/map';
import Link from 'next/link';
import { useRunHistory } from '@/stores';

// Define a unified Route interface
interface Route {
    id: string;
    name: string;
    distance: string;
    duration: string;
    coordinates: [number, number][];
    image: string;
    rating?: number;
    author?: string;
    date?: string;
}

// Mock data for routes
const DISCOVER_ROUTES: Route[] = [
    {
        id: 'cannonball',
        name: 'Cannonball Run',
        distance: '2,800 mi',
        duration: '28h 30m',
        rating: 4.9,
        author: 'Cannonball Club',
        image: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=2070&auto=format&fit=crop',
        coordinates: [
            [-74.012, 40.706],   // NYC
            [-95.3698, 29.7604], // Houston
            [-112.0740, 33.4484], // Phoenix
            [-118.2437, 34.0522] // Los Angeles
        ]
    },
    {
        id: 'r1',
        name: 'Mulholland Drive',
        distance: '21.0 mi',
        duration: '45 min',
        rating: 4.8,
        author: 'Alex R.',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop',
        coordinates: [[-118.4, 34.1], [-118.5, 34.15], [-118.6, 34.12]]
    },
    {
        id: 'r2',
        name: 'Angeles Crest Highway',
        distance: '66.0 mi',
        duration: '1h 30m',
        rating: 4.9,
        author: 'Sarah J.',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1874&auto=format&fit=crop',
        coordinates: [[-118.1, 34.2], [-118.0, 34.3], [-117.9, 34.35]]
    }
];

const MY_ROUTES: Route[] = [
    {
        id: 'mr1',
        name: 'Work Commute (Fun Way)',
        distance: '15.4 mi',
        duration: '35 min',
        rating: 4.0,
        author: 'You',
        image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop',
        coordinates: [[-118.25, 34.05], [-118.3, 34.08], [-118.35, 34.1]]
    }
];

const HISTORY_ROUTES: Route[] = [
    {
        id: 'h1',
        name: 'Late Night Loop',
        distance: '12.5 mi',
        duration: '18 min',
        date: 'Yesterday',
        image: 'https://images.unsplash.com/photo-1542259682-167814b60967?q=80&w=2069&auto=format&fit=crop',
        coordinates: [[-118.2, 34.0], [-118.22, 34.02], [-118.24, 34.01]]
    }
];

type Tab = 'discover' | 'my-routes' | 'history';

export default function RoutesPage() {
    const [activeTab, setActiveTab] = useState<Tab>('discover');
    const runs = useRunHistory(state => state.runs);

    // Convert runs to Route objects
    const historyRoutes: Route[] = runs.map(run => ({
        id: run.id,
        name: `Test Run ${new Date(run.timestamp).toLocaleDateString()}`,
        distance: `${run.distanceKm.toFixed(1)} mi`, // Approx conversion or store as mi
        duration: `${Math.floor(run.durationMs / 60000)} min`,
        date: new Date(run.timestamp).toLocaleDateString(),
        // Use a generic map image or a placeholder since we don't generate static map images yet
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop',
        coordinates: run.previewTrace,
        rating: 5.0
    }));

    const routes = activeTab === 'discover' ? DISCOVER_ROUTES
        : activeTab === 'my-routes' ? MY_ROUTES
            : historyRoutes;

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-[#06040A]">
            {/* Header & Tabs */}
            <div className="px-4 pt-6">
                <h1 className="text-2xl font-black italic tracking-tighter text-[#F5F5F4] mb-4">
                    ROUTES
                </h1>

                <div className="flex gap-2 justify-center py-2 overflow-x-auto scrollbar-hide mb-4">
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'discover'
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]">Discover</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('my-routes')}
                        className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'my-routes'
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]">My Routes</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === 'history'
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em]">History</span>
                    </button>
                </div>
            </div>

            {/* Map Box */}
            <div className="px-4 mb-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0D0B14]" style={{ height: '240px' }}>
                    <MapProvider>
                        <BaseMap
                            initialCenter={[-118.4, 34.1]}
                            initialZoom={10}
                            className="h-full w-full"
                        >
                            {routes.map(route => (
                                <RouteLayer
                                    key={route.id}
                                    id={route.id}
                                    coordinates={route.coordinates}
                                    color='#8B5CF6'
                                    width={4}
                                    opacity={0.8}
                                />
                            ))}
                        </BaseMap>
                    </MapProvider>
                </div>
            </div>

            {/* Routes List */}
            <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-3 pb-4">
                    {routes.map(route => (
                        <Link
                            key={route.id}
                            href={`/drives/${route.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="bg-[#0D0B14]/80 backdrop-blur-md border border-white/5 p-3 rounded-xl flex gap-3 hover:border-[#8B5CF6]/30 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                <img src={route.image} alt={route.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="font-bold text-sm text-[#F5F5F4]">{route.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[#A8A8A8] text-xs">straighten</span>
                                        <span className="text-[#A8A8A8] text-xs font-medium">{route.distance}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[#A8A8A8] text-xs">timer</span>
                                        <span className="text-[#A8A8A8] text-xs font-medium">{route.duration}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between items-end py-1">
                                {route.rating && (
                                    <div className="flex items-center gap-0.5 bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded text-xs">
                                        <span className="material-symbols-outlined text-[#8B5CF6] text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-[#8B5CF6] text-[10px] font-bold">{route.rating}</span>
                                    </div>
                                )}
                                <span className="material-symbols-outlined text-[#A8A8A8]">chevron_right</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
