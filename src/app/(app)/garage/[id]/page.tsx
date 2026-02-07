'use client';

import Link from 'next/link';

// Mock DB
const VEHICLE_DATA: Record<string, any> = {
    'v1': {
        id: 'v1',
        year: 2022,
        make: 'Porsche',
        model: '911',
        trim: 'GT3',
        image: 'https://images.unsplash.com/photo-1611859328053-372092258399?q=80&w=2070&auto=format&fit=crop',
        specs: { engine: '4.0L Flat-6', power: '502 hp', drive: 'RWD', torque: '346 lb-ft', weight: '3,164 lbs' },
        mods: [
            { name: 'Dundon Motorsports Exhaust', type: 'Performance' },
            { name: 'Michelin Cup 2 R Tires', type: 'Wheels & Tires' },
        ]
    },
    'v2': {
        id: 'v2',
        year: 2024,
        make: 'Rivian',
        model: 'R1T',
        trim: 'Quad-Motor',
        image: 'https://images.unsplash.com/photo-1669046603415-376518174783?q=80&w=1974&auto=format&fit=crop',
        specs: { engine: 'Quad-Motor', power: '835 hp', drive: 'AWD', torque: '908 lb-ft', weight: '7,148 lbs' },
        mods: []
    }
};

export default function VehicleDetailsPage({ params }: { params: { id: string } }) {
    const vehicle = VEHICLE_DATA[params.id];

    if (!vehicle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-[#F5F5F4]">
                <h1 className="text-2xl font-bold">Vehicle not found</h1>
                <Link href="/garage" className="text-[#8B5CF6] mt-4">Back to Garage</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4] pb-24">
            {/* Header */}
            <div className="relative h-[40vh] w-full">
                <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06040A] via-[#06040A]/20 to-transparent" />

                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                    <Link href="/garage" className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </Link>
                    <button className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
                        <span className="material-symbols-outlined text-white">edit</span>
                    </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl font-black italic tracking-tighter mb-1">
                        {vehicle.year} {vehicle.make}
                    </h1>
                    <h2 className="text-xl text-slate-300 font-bold">{vehicle.model} <span className="text-[#8B5CF6]">{vehicle.trim}</span></h2>
                </div>
            </div>

            <main className="px-6 py-6 space-y-8 max-w-md mx-auto">
                {/* Stats Grid */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Specs</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <SpecCard label="Engine" value={vehicle.specs.engine} icon="engine" />
                        <SpecCard label="Power" value={vehicle.specs.power} icon="bolt" />
                        <SpecCard label="Drivetrain" value={vehicle.specs.drive} icon="tire_repair" />
                        <SpecCard label="Torque" value={vehicle.specs.torque} icon="speed" />
                        <SpecCard label="Weight" value={vehicle.specs.weight} icon="scale" />
                    </div>
                </div>

                {/* Modifications */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Modifications</h3>
                    {vehicle.mods.length > 0 ? (
                        <div className="space-y-2">
                            {vehicle.mods.map((mod: any, i: number) => (
                                <div key={i} className="bg-[#0D0B14] p-4 rounded-xl border border-white/5 flex flex-col">
                                    <span className="font-bold text-sm">{mod.name}</span>
                                    <span className="text-xs text-slate-500 mt-1">{mod.type}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-[#0D0B14] rounded-xl border border-white/5 border-dashed">
                            <span className="text-slate-500 text-sm">No modifications yet</span>
                        </div>
                    )}
                </div>

                {/* Service History Mock */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Service History</h3>
                        <button className="text-xs text-[#8B5CF6] font-bold">View All</button>
                    </div>
                    <div className="space-y-4 relative pl-4 border-l border-white/10">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-[#8B5CF6]" />
                            <p className="text-sm font-bold text-white">Oil Change & Inspection</p>
                            <p className="text-xs text-slate-500">Oct 24, 2025 • 12,450 mi</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-slate-600" />
                            <p className="text-sm font-bold text-white">Tire Rotation</p>
                            <p className="text-xs text-slate-500">Aug 12, 2025 • 10,000 mi</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SpecCard({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <div className="bg-[#0D0B14] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
            <span className="material-symbols-outlined text-[#8B5CF6] text-xl mb-1">{icon}</span>
            <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">{label}</span>
            <span className="text-white font-bold text-sm truncate">{value}</span>
        </div>
    );
}
