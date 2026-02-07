'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    StatsCard,
    TimeChart,
    TopList,
    VehicleDistribution,
    DetectionMethodBreakdown
} from '@/components/analytics';
import { PatternDiscovery, AnomalyList } from '@/components/insights';
import { BaseMap, LeafletPoliceStops } from '@/components/map';
import {
    Activity,
    Car,
    AlertTriangle,
    Clock,
    Target,
    Map as MapIcon,
    BarChart3,
    Zap,
    ChevronRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsData {
    overview: {
        totalStops: number;
        alcoholStops: number;
        accidentStops: number;
        searchStops: number;
        fatalStops: number;
        alcoholRate: string;
        accidentRate: string;
    };
    dateRange: {
        start: string;
        end: string;
    };
    topLocations: Array<{ name: string; count: number }>;
    violationTypes: Array<{ type: string; count: number }>;
    vehicleMakes: Array<{ make: string; count: number }>;
    detectionMethods: Array<{ method: string; count: number; percentage: number }>;
}

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'insights'>('overview');
    const [stats, setStats] = useState<StatsData | null>(null);
    const [hourlyData, setHourlyData] = useState<any[]>([]);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [statsRes, hourlyRes, dailyRes] = await Promise.all([
                fetch('/api/analytics/stats'),
                fetch('/api/analytics/time-patterns?groupBy=hour'),
                fetch('/api/analytics/time-patterns?groupBy=day')
            ]);

            if (statsRes.ok) {
                const statsJson = await statsRes.json();
                if (statsJson.success) setStats(statsJson.data);
            }

            if (hourlyRes.ok) {
                const hourlyJson = await hourlyRes.json();
                if (hourlyJson.success) setHourlyData(hourlyJson.data);
            }

            if (dailyRes.ok) {
                const dailyJson = await dailyRes.json();
                if (dailyJson.success) setDailyData(dailyJson.data || []);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load enforcement data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-zinc-500 animate-pulse uppercase tracking-[0.2em]">Synchronizing Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#030205] pb-32">
            {/* Header Section */}
            <div className="px-6 pt-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black italic tracking-tight text-[#F5F5F4]">
                        ENFORCEMENT <span className="text-[#8B5CF6]">INTEL</span>
                    </h2>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8B5CF6]"></span>
                        </span>
                        Live Intelligence
                    </div>
                </div>
                <p className="text-[11px] text-[#A8A8A8] uppercase tracking-[0.1em] font-medium max-w-[280px]">
                    Analysis of historical traffic enforcement records and real-time patterns.
                </p>
            </div>

            {/* Custom Tab Switcher */}
            <div className="px-6 mb-6">
                <div className="flex p-1 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-full">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'map', label: 'Intelligence Map', icon: MapIcon },
                        { id: 'insights', label: 'ML Insights', icon: Zap },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Stats Summary Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <StatsCard
                                title="Total Activity"
                                value={stats?.overview?.totalStops || 0}
                                icon={<Activity className="w-4 h-4" />}
                                color="purple"
                                className="bg-zinc-900/40 border-zinc-800/50"
                            />
                            <StatsCard
                                title="Alcohol Related"
                                value={stats?.overview?.alcoholStops || 0}
                                subtitle={stats?.overview?.alcoholRate}
                                icon={<AlertTriangle className="w-4 h-4" />}
                                color="red"
                                className="bg-zinc-900/40 border-zinc-800/50"
                            />
                            <StatsCard
                                title="Accidents"
                                value={stats?.overview?.accidentStops || 0}
                                subtitle={stats?.overview?.accidentRate}
                                icon={<Car className="w-4 h-4" />}
                                color="default"
                                className="bg-zinc-900/40 border-zinc-800/50"
                            />
                            <StatsCard
                                title="Probable Search"
                                value={stats?.overview?.searchStops || 0}
                                icon={<Search className="w-4 h-4" />}
                                color="blue"
                                className="bg-zinc-900/40 border-zinc-800/50"
                            />
                        </div>


                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Detection Method Breakdown */}
                            <DetectionMethodBreakdown
                                data={stats?.detectionMethods || []}
                            />

                            {/* Temporal Patterns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TimeChart
                                    data={hourlyData}
                                    title="Speed stops by hour"
                                />
                                <TimeChart
                                    data={dailyData}
                                    title="Speed stops by day"
                                />
                            </div>

                            {/* Tactical Lists */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TopList
                                    title="Top Speed Enforcement Areas"
                                    items={stats?.topLocations || []}
                                />
                                <VehicleDistribution
                                    data={stats?.vehicleMakes || []}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="relative h-[450px] rounded-3xl overflow-hidden border border-zinc-800/50 shadow-2xl">
                            <BaseMap
                                initialCenter={[-77.0365, 38.8977]} // Example: DC area
                                initialZoom={11}
                            >
                                <LeafletPoliceStops
                                    onStopClick={(props) => console.log('Stop clicked:', props)}
                                />
                            </BaseMap>

                            {/* Map Legend/Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#030205]/80 backdrop-blur-md border border-white/10 rounded-xl z-[1000]">
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#A8A8A8]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                                        <span>Standard</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                                        <span>DUI</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
                                        <span>Accident</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
                            <h3 className="text-xs font-black uppercase italic tracking-wider text-[#F5F5F4] mb-4">Temporal Heatmap</h3>
                            <TimeChart data={hourlyData} title="Hourly Enforcement Intensity" />
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* ML Patterns */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <Zap className="w-5 h-5 text-[#8B5CF6]" />
                                <h3 className="text-lg font-black italic uppercase text-white">Neural Pattern Detection</h3>
                            </div>
                            <PatternDiscovery />
                        </div>

                        {/* Recent Anomalies */}
                        <div className="p-5 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/50 rounded-3xl">
                            <h3 className="text-xs font-black uppercase italic tracking-[0.2em] text-[#8B5CF6] mb-4">Statistical Anomalies</h3>
                            <AnomalyList />
                        </div>

                        {/* Risk Assessment Footer */}
                        <div className="p-6 bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-3xl border-dashed">
                            <p className="text-xs text-center text-[#A8A8A8] leading-relaxed">
                                Our ML engine analyzes historical clusters to predict high-probability enforcement windows. Cross-reference these insights with the <span className="text-[#8B5CF6] font-bold">Intelligence Map</span> for tactical navigation.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
