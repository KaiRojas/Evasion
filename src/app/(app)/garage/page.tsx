'use client';

import Link from 'next/link';

// Mock data
const VEHICLES = [
    {
        id: 'v1',
        year: 2022,
        make: 'Porsche',
        model: '911',
        trim: 'GT3',
        image: 'https://images.unsplash.com/photo-1611859328053-372092258399?q=80&w=2070&auto=format&fit=crop',
        specs: { engine: '4.0L Flat-6', power: '502 hp', drive: 'RWD' }
    },
    {
        id: 'v2',
        year: 2024,
        make: 'Rivian',
        model: 'R1T',
        trim: 'Quad-Motor',
        image: 'https://images.unsplash.com/photo-1669046603415-376518174783?q=80&w=1974&auto=format&fit=crop',
        specs: { engine: 'Quad-Motor', power: '835 hp', drive: 'AWD' }
    }
];

export default function GaragePage() {
    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/profile" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold">My Garage</h1>
                    <Link href="/garage/add" className="text-[#8B5CF6]">
                        <span className="material-symbols-outlined">add_circle</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {VEHICLES.map(vehicle => (
                    <Link
                        key={vehicle.id}
                        href={`/garage/${vehicle.id}`}
                        className="block bg-[#0D0B14] rounded-xl overflow-hidden border border-white/5 hover:border-[#8B5CF6]/30 transition-all group"
                    >
                        {/* Image */}
                        <div className="aspect-[16/9] w-full bg-white/5 relative">
                            <img src={vehicle.image} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B14] via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                <div>
                                    <h2 className="text-xl font-bold leading-tight drop-shadow-lg">
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                    </h2>
                                    <p className="text-sm text-slate-300 font-medium drop-shadow-md">{vehicle.trim}</p>
                                </div>
                            </div>
                        </div>
                        {/* Quick Specs */}
                        <div className="p-4 flex gap-4 text-xs text-slate-400 bg-[#0D0B14] border-t border-white/5 group-hover:bg-[#18181B] transition-colors">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">engine</span>
                                <span>{vehicle.specs.engine}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                <span>{vehicle.specs.power}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">tire_repair</span>
                                <span>{vehicle.specs.drive}</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Add Vehicle Card */}
                <Link
                    href="/garage/add"
                    className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 transition-all group cursor-pointer"
                >
                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#8B5CF6]/20 transition-colors">
                        <span className="material-symbols-outlined text-slate-400 text-3xl group-hover:text-[#8B5CF6] transition-colors">add</span>
                    </div>
                    <p className="font-bold text-slate-400 group-hover:text-white transition-colors">Add Another Vehicle</p>
                </Link>
            </main>
        </div>
    );
}
