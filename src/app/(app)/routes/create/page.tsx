'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapProvider, BaseMap, RouteLayer } from '@/components/map';
import { useMap } from '@/components/map/MapProvider';
import Link from 'next/link';

// Simple UI components to replace missing @/components/ui if needed, 
// or assuming they exist since the dashboard used them.
// I'll use standard HTML/Tailwind for safety to "flesh it out" with lower risk of missing deps.

export default function CreateRoutePage() {
    const router = useRouter();
    const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
    const [routeName, setRouteName] = useState('');
    const [routeDescription, setRouteDescription] = useState('');
    const [difficulty, setDifficulty] = useState('MODERATE');
    const [tags, setTags] = useState('');
    const [isDrawing, setIsDrawing] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleMapClick = useCallback((lng: number, lat: number) => {
        if (!isDrawing) return;
        setRoutePoints((prev) => [...prev, [lng, lat]]);
    }, [isDrawing]);

    const handleUndo = () => {
        setRoutePoints((prev) => prev.slice(0, -1));
    };

    const handleClear = () => {
        setRoutePoints([]);
    };

    const handleSave = async () => {
        if (routePoints.length < 2 || !routeName) return;

        setIsSaving(true);

        // Calculate approximate distance
        let distance = 0;
        for (let i = 1; i < routePoints.length; i++) {
            const [lng1, lat1] = routePoints[i - 1];
            const [lng2, lat2] = routePoints[i];
            distance += Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)) * 69;
        }

        const routeData = {
            name: routeName,
            description: routeDescription,
            pathCoordinates: routePoints,
            distanceMiles: Math.round(distance * 10) / 10,
            difficulty,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            isPublic: true,
        };

        console.log('Saving route:', routeData);

        setTimeout(() => {
            setIsSaving(false);
            router.push('/routes');
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen bg-[#06040A] text-[#F5F5F4] pb-20">
            {/* Height calc to account for bottom nav if needed, or Z-index over it */}

            {/* Map Area */}
            <div className="flex-1 relative">
                <MapProvider>
                    <BaseMap
                        initialCenter={[-118.2437, 34.0522]}
                        initialZoom={11}
                        className="w-full h-full"
                        onClick={handleMapClick}
                    >
                        {routePoints.length >= 2 && (
                            <RouteLayer
                                id="new-route"
                                coordinates={routePoints}
                                color="#f97316" // Orange
                                width={5}
                                opacity={0.8}
                            />
                        )}
                        <PointsOverlay points={routePoints} />
                    </BaseMap>

                    {/* Top Controls */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                        <Link href="/routes" className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div className="pointer-events-auto flex gap-2">
                            <button
                                onClick={() => setIsDrawing(!isDrawing)}
                                className={`px-3 py-2 rounded-full font-bold text-xs flex items-center gap-1 transition-colors ${isDrawing ? 'bg-[#8B5CF6] text-white' : 'bg-black/60 text-slate-300 backdrop-blur-md'}`}
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                {isDrawing ? 'Drawing' : 'View'}
                            </button>
                            <button onClick={handleUndo} disabled={routePoints.length === 0} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">undo</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Sheet / Form */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="bg-[#0D0B14]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-h-[40vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-bold">New Route</h2>
                                    <p className="text-xs text-slate-400">
                                        {routePoints.length} points • {(() => {
                                            let d = 0;
                                            for (let i = 1; i < routePoints.length; i++) {
                                                const [lng1, lat1] = routePoints[i - 1];
                                                const [lng2, lat2] = routePoints[i];
                                                d += Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)) * 69;
                                            }
                                            return `${Math.round(d * 10) / 10} mi`;
                                        })()}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={routePoints.length < 2 || !routeName}
                                    className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Route Name"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:border-[#8B5CF6] outline-none transition-colors"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:border-[#8B5CF6] outline-none"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MODERATE">Moderate</option>
                                        <option value="CHALLENGING">Hard</option>
                                        <option value="EXPERT">Expert</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Tags (scenic, night)"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm focus:border-[#8B5CF6] outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </MapProvider>
            </div>
        </div>
    );
}

function PointsOverlay({ points }: { points: [number, number][] }) {
    // This could render markers if MapProvider exposed a way to add them dynamically without a layer
    // For now BaseMap handles basic rendering. 
    return null;
}
