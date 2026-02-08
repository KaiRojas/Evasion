'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Share2, MoreHorizontal, ChevronDown } from 'lucide-react';
import { generateMockTelemetry, DriveTelemetry } from '@/lib/telemetry';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const BaseMap = dynamic(() => import('@/components/map/BaseMap').then(mod => mod.BaseMap), { ssr: false });
const RouteLayer = dynamic(() => import('@/components/map/RouteLayer').then(mod => mod.RouteLayer), { ssr: false });
const HeatmapRouteLayer = dynamic(() => import('@/components/map/HeatmapRouteLayer').then(mod => mod.HeatmapRouteLayer), { ssr: false });

export default function DriveDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [driveData, setDriveData] = useState<DriveTelemetry | null>(null);
    const [mapMode, setMapMode] = useState<'route' | 'braking' | 'accel' | 'gforce'>('route');
    const [mapMenuOpen, setMapMenuOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            setDriveData(generateMockTelemetry(params.id as string));
        }
    }, [params.id]);

    const durationMinutes = useMemo(() => {
        if (!driveData?.points?.length) return 0;
        return Math.max(1, Math.round((driveData.points.length - 1) * 0.5));
    }, [driveData?.points?.length]);

    if (!driveData) return null;

    return (
        <div className="flex flex-col min-h-screen bg-[#06040A] pb-24">
            {/* Header Nav */}
            <div className="sticky top-0 z-[60] bg-[#06040A]/80 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full text-zinc-400">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-white font-bold text-sm tracking-tight">Drive</h1>
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-white/5 rounded-full text-zinc-400">
                        <Share2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full text-zinc-400">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            <div className="px-5 pt-5 space-y-4">
                {/* Title */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">Midnight Loop</h2>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Mulholland Dr. | Yesterday</p>
                    </div>
                    <div className="px-2 py-1 rounded-md border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]">
                        Delta +{driveData.stats.performanceDelta}%
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 p-3">
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Distance</div>
                        <div className="text-xl font-black text-white italic">{driveData.stats.totalDistance}<span className="text-xs opacity-50 ml-1">MI</span></div>
                    </div>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 p-3">
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Time</div>
                        <div className="text-xl font-black text-white italic">{durationMinutes}<span className="text-xs opacity-50 ml-1">MIN</span></div>
                    </div>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 p-3">
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Avg Speed</div>
                        <div className="text-xl font-black text-white italic">{driveData.stats.avgSpeed}<span className="text-xs opacity-50 ml-1">MPH</span></div>
                    </div>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 p-3">
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Performance</div>
                        <div className="text-xl font-black text-white italic">+{driveData.stats.performanceDelta}<span className="text-xs opacity-50 ml-1">%</span></div>
                    </div>
                </div>

                {/* Map Preview Card */}
                <div
                    className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0B14] h-44"
                    onClick={() => setMapMenuOpen(prev => !prev)}
                >
                    <BaseMap
                        initialCenter={[driveData.points[0].lng, driveData.points[0].lat]}
                        initialZoom={13}
                        hideControls
                        className="h-full w-full"
                    >
                        <RouteLayer
                            id="drive-route"
                            coordinates={driveData.points.map(p => [p.lng, p.lat])}
                            color="#2E2A33"
                            width={4}
                            opacity={0.7}
                        />
                        {mapMode !== 'route' && (
                            <HeatmapRouteLayer
                                points={driveData.points.map(p => ({
                                    lat: p.lat,
                                    lng: p.lng,
                                    value: mapMode === 'braking' ? p.brakePressure : mapMode === 'accel' ? p.acceleration : Math.abs(p.acceleration) * 1.2
                                }))}
                                mode={mapMode === 'braking' ? 'braking' : 'speed'}
                                width={5}
                            />
                        )}
                    </BaseMap>

                    <div className="absolute top-3 left-3 z-[400] text-[10px] uppercase tracking-widest text-white/70">
                        Tap map for analytics
                    </div>

                    <div className="absolute top-3 right-3 z-[400]">
                        <button
                            onClick={(e) => { e.stopPropagation(); setMapMenuOpen(prev => !prev); }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#06040A]/85 border border-white/10 text-[10px] uppercase tracking-widest text-white/70"
                        >
                            {mapMode === 'route' ? 'Route' : mapMode === 'braking' ? 'Braking zones' : mapMode === 'accel' ? 'Acceleration zones' : 'High G zones'}
                            <ChevronDown size={12} className={cn("transition-transform", mapMenuOpen ? "rotate-180" : "")} />
                        </button>
                        {mapMenuOpen && (
                            <div className="mt-2 w-48 bg-[#0D0B14]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 text-[11px] uppercase tracking-widest text-white/70">
                                {[
                                    { key: 'route', label: 'Route' },
                                    { key: 'braking', label: 'Braking zones' },
                                    { key: 'accel', label: 'Acceleration zones' },
                                    { key: 'gforce', label: 'High G zones' },
                                ].map(option => (
                                    <button
                                        key={option.key}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMapMode(option.key as typeof mapMode);
                                            setMapMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg transition-colors",
                                            mapMode === option.key ? "bg-white text-black" : "hover:bg-white/5"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
