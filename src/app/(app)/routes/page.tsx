'use client';

import { useState } from 'react';
import { MapProvider, BaseMap, RouteLayer } from '@/components/map';

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
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

    const routes = activeTab === 'discover' ? DISCOVER_ROUTES
        : activeTab === 'my-routes' ? MY_ROUTES
            : HISTORY_ROUTES;

    const activeRouteData = routes.find(r => r.id === selectedRoute);

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
                                    color={selectedRoute === route.id ? '#8B5CF6' : '#52525B'}
                                    width={selectedRoute === route.id ? 6 : 4}
                                    opacity={selectedRoute === route.id ? 1 : 0.6}
                                />
                            ))}
                        </BaseMap>
                    </MapProvider>
                </div>
            </div>

            {/* Routes List */}
            <div className="flex-1 px-4 overflow-y-auto hide-scrollbar">
                {/* Selected Route Quick Stats Overlay */}
                {activeRouteData && (
                    <div className="mb-4 bg-[#0D0B14]/90 backdrop-blur-xl border border-[#8B5CF6]/30 rounded-2xl p-4 animate-slide-up shadow-xl shadow-black/50">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-white leading-none">{activeRouteData.name}</h3>
                                <p className="text-xs text-[#A8A8A8] mt-1">by {activeRouteData.author || 'You'}</p>
                            </div>
                            <button
                                onClick={() => setSelectedRoute(null)}
                                className="p-1 hover:bg-white/10 rounded-full"
                            >
                                <span className="material-symbols-outlined text-[#A8A8A8]">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-[#18181B]/50 rounded-lg p-2 flex flex-col items-center">
                                <span className="material-symbols-outlined text-[#8B5CF6] text-lg mb-1">straighten</span>
                                <span className="text-sm font-bold text-white">{activeRouteData.distance}</span>
                            </div>
                            <div className="bg-[#18181B]/50 rounded-lg p-2 flex flex-col items-center">
                                <span className="material-symbols-outlined text-[#8B5CF6] text-lg mb-1">timer</span>
                                <span className="text-sm font-bold text-white">{activeRouteData.duration}</span>
                            </div>
                            <div className="bg-[#18181B]/50 rounded-lg p-2 flex flex-col items-center">
                                <span className="material-symbols-outlined text-[#8B5CF6] text-lg mb-1">star</span>
                                <span className="text-sm font-bold text-white">{activeRouteData.rating || '-'}</span>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]">
                            Start Drive
                        </button>
                    </div>
                )}

                {/* List View */}
                {!selectedRoute && (
                    <div className="flex flex-col gap-3 pb-4">
                        {routes.map(route => (
                            <div
                                key={route.id}
                                onClick={() => setSelectedRoute(route.id)}
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
                            </div>
                        ))}
                    </div>
                )}
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
