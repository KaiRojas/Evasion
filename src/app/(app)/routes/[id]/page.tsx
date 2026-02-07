'use client';

import Link from 'next/link';

// Detailed Mock Data (extended from routes page)
const ROUTE_DETAILS: Record<string, any> = {
    'r1': {
        id: 'r1',
        name: 'Mulholland Drive',
        distance: '21.0 mi',
        duration: '45 min',
        rating: 4.8,
        author: 'Alex R.',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop',
        description: 'The iconic canyon run. Tight turns, stunning views of the city, and perfect asphalt. Watch out for tourists during the day.',
        elevation: '+1,240 ft',
        difficulty: 'Hard',
        surface: 'Asphalt',
        traffic: 'Moderate',
        checkpoints: 12,
        leaderboard: [
            { rank: 1, name: 'SpeedDemon', time: '38:12', vehicle: 'Porsche 911 GT3' },
            { rank: 2, name: 'CanyonCarver', time: '39:05', vehicle: 'BMW M3' },
            { rank: 3, name: 'Alex R.', time: '40:22', vehicle: 'Subaru WRX' },
        ],
        comments: [
            { user: 'Sarah J.', text: 'Best run in LA hands down.', time: '2h ago' },
            { user: 'Mike T.', text: 'Police were active near the overlook.', time: '5h ago' }
        ]
    },
    'r2': {
        id: 'r2',
        name: 'Angeles Crest Highway',
        distance: '66.0 mi',
        duration: '1h 30m',
        rating: 4.9,
        author: 'Sarah J.',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1874&auto=format&fit=crop',
        description: 'High-speed mountain highway. Wide lanes, sweeping curves, and massive elevation changes.',
        elevation: '+4,500 ft',
        difficulty: 'Medium',
        surface: 'Asphalt',
        traffic: 'Low',
        checkpoints: 8,
        leaderboard: [],
        comments: []
    }
};

export default function RouteDetailsPage({ params }: { params: { id: string } }) {
    const route = ROUTE_DETAILS[params.id];

    if (!route) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-[#F5F5F4]">
                <h1 className="text-2xl font-bold">Route not found</h1>
                <Link href="/routes" className="text-[#8B5CF6] mt-4">Back to Routes</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4] pb-24">
            {/* Hero Map/Image */}
            <div className="relative h-[45vh] w-full bg-[#18181B]">
                <img src={route.image} alt={route.name} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06040A] via-transparent to-transparent" />

                {/* Header Actions */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                    <Link href="/routes" className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <div className="flex gap-2">
                        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
                            <span className="material-symbols-outlined text-white">share</span>
                        </button>
                        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
                            <span className="material-symbols-outlined text-white">favorite_border</span>
                        </button>
                    </div>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${route.difficulty === 'Hard' ? 'bg-red-500/20 text-red-500' :
                                route.difficulty === 'Medium' ? 'bg-orange-500/20 text-orange-500' :
                                    'bg-green-500/20 text-green-500'
                            }`}>
                            {route.difficulty}
                        </span>
                        <div className="flex items-center gap-1 bg-[#8B5CF6]/20 px-2 py-0.5 rounded text-[10px] text-[#8B5CF6] font-bold">
                            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {route.rating}
                        </div>
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter mb-1">{route.name}</h1>
                    <p className="text-sm text-slate-300">by <span className="text-white font-bold">{route.author}</span></p>
                </div>
            </div>

            <main className="px-6 py-6 space-y-8 max-w-md mx-auto">
                {/* Action Button */}
                <button className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl uppercase tracking-wider shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                    <span className="material-symbols-outlined">directions_car</span>
                    Start Drive
                </button>

                {/* Key Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <StatBox label="Distance" value={route.distance} icon="straighten" />
                    <StatBox label="Est. Time" value={route.duration} icon="timer" />
                    <StatBox label="Elevation" value={route.elevation} icon="landscape" />
                    <StatBox label="Traffic" value={route.traffic} icon="traffic" />
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">About Route</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{route.description}</p>
                </div>

                {/* Leaderboard */}
                {route.leaderboard.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Leaderboard</h3>
                            <button className="text-xs text-[#8B5CF6] font-bold">View All</button>
                        </div>
                        <div className="bg-[#0D0B14] rounded-xl border border-white/5 overflow-hidden">
                            {route.leaderboard.map((entry: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${entry.rank === 1 ? 'bg-yellow-500 text-black' :
                                                entry.rank === 2 ? 'bg-slate-300 text-black' :
                                                    entry.rank === 3 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                            {entry.rank}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white max-w-[100px] truncate">{entry.name}</p>
                                            <p className="text-[10px] text-slate-500">{entry.vehicle}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono text-[#8B5CF6] font-bold">{entry.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatBox({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <div className="bg-[#0D0B14] p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
            <span className="material-symbols-outlined text-[#8B5CF6] text-lg">{icon}</span>
            <span className="text-white font-bold text-xs">{value}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</span>
        </div>
    );
}
