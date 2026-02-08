'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';

const MOCK_VEHICLES = [
    {
        id: 'v1',
        name: '2022 Porsche 911 GT3',
        specs: '4.0L Flat-6 • 502 hp',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1969&auto=format&fit=crop'
    },
    {
        id: 'v2',
        name: '2024 Rivian R1T',
        specs: 'Quad-Motor • 835 hp',
        image: 'https://images.unsplash.com/photo-1669046603415-376518174783?q=80&w=1974&auto=format&fit=crop'
    }
];

const MOCK_DRIVES = [
    {
        id: 'cannonball',
        name: 'Cannonball Run',
        meta: '2,800 mi • 28h 30m • Avg 78 mph',
        image: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 'midnight-loop',
        name: 'Midnight Loop',
        meta: '12.5 mi • 18 min • Avg 52 mph',
        image: 'https://images.unsplash.com/photo-1542259682-167814b60967?q=80&w=2069&auto=format&fit=crop'
    }
];

const MOCK_ROUTES = [
    {
        id: 'angeles-crest',
        name: 'Angeles Crest Highway',
        meta: '66.0 mi • 1h 30m',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1874&auto=format&fit=crop'
    },
    {
        id: 'mulholland',
        name: 'Mulholland Drive',
        meta: '21.0 mi • 45 min',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'
    }
];

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Create display user with fallback values for profile display
    const displayUser = {
        name: user?.displayName || 'Guest',
        username: user?.username || 'guest',
        bio: isAuthenticated ? 'Car enthusiast' : 'Sign in to track your drives',
        avatarUrl: user?.avatarUrl || '',
        isVerified: user?.isVerified || false,
        stats: { drives: 12, distance: '248 mi', friends: 45 } // Mock stats for now
    };

    return (
        <div className="flex flex-col pb-10">
            {/* Header */}
            <div className="px-4 pt-2 flex items-center justify-between">
                <Link href="/settings" className="inline-flex p-2 hover:bg-white/5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[#F5F5F4]">settings</span>
                </Link>
                <Link href="/profile/edit" className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">
                    Edit
                </Link>
            </div>

            {/* Profile Header */}
            <section className="px-6 pt-2 pb-6">
                <div className="relative rounded-2xl bg-[#0D0B14] border border-white/5 overflow-hidden">
                    <div className="h-24 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(239,68,68,0.15),transparent_50%)]" />
                    <div className="-mt-12 px-5 pb-5">
                        <div className="flex items-end gap-4">
                            <div className="size-24 rounded-full p-1.5 bg-gradient-to-tr from-[#8B5CF6] to-purple-400">
                                <div
                                    className="size-full rounded-full bg-[#06040A] border-4 border-[#06040A] overflow-hidden bg-center bg-cover"
                                    style={{
                                        backgroundImage: displayUser.avatarUrl ? `url('${displayUser.avatarUrl}')` : 'none',
                                        backgroundColor: displayUser.avatarUrl ? 'transparent' : '#1a1a2e'
                                    }}
                                >
                                    {!displayUser.avatarUrl && (
                                        <div className="size-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-white/30">person</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight text-[#F5F5F4]">{displayUser.name}</h2>
                                    {displayUser.isVerified && (
                                        <span className="material-symbols-outlined text-[#8B5CF6] text-sm">verified</span>
                                    )}
                                </div>
                                <p className="text-slate-400 font-medium text-sm">@{displayUser.username}</p>
                                <p className="mt-2 text-slate-300 text-xs max-w-[260px]">{displayUser.bio}</p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="bg-[#06040A] rounded-xl border border-white/5 p-3 text-center">
                                <div className="text-lg font-black text-white">{displayUser.stats.drives}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Drives</div>
                            </div>
                            <div className="bg-[#06040A] rounded-xl border border-white/5 p-3 text-center">
                                <div className="text-lg font-black text-white">{displayUser.stats.distance}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Distance</div>
                            </div>
                            <div className="bg-[#06040A] rounded-xl border border-white/5 p-3 text-center">
                                <div className="text-lg font-black text-white">{displayUser.stats.friends}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Friends</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Badges */}
            <section className="px-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold tracking-tight text-[#F5F5F4]">Badges</h3>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Top 4</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { icon: 'dark_mode', color: '#8B5CF6', label: 'Night Owl' },
                        { icon: 'star_rate', color: '#F59E0B', label: 'Centurion' },
                        { icon: 'route', color: '#22C55E', label: 'Explorer' },
                        { icon: 'trophy', color: '#64748B', label: 'Champion', locked: true },
                    ].map((badge) => (
                        <div key={badge.label} className={cn("flex flex-col items-center gap-2", badge.locked ? "opacity-40 grayscale" : "")}>
                            <div className="size-14 rounded-full bg-[#0D0B14] flex items-center justify-center border-2 border-white/10">
                                <span className="material-symbols-outlined text-2xl" style={{ color: badge.color }}>{badge.icon}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase text-center">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Garage */}
            <section className="mt-8">
                <div className="flex items-center justify-between px-6 mb-3">
                    <h3 className="text-sm font-bold tracking-tight text-[#F5F5F4]">Garage</h3>
                    <Link href="/garage" className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">View All</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 pb-3 hide-scrollbar snap-x snap-mandatory">
                    {MOCK_VEHICLES.map(vehicle => (
                        <Link key={vehicle.id} href={`/garage/${vehicle.id}`} className="flex-none w-72 snap-start">
                            <div className="bg-[#0D0B14] rounded-xl overflow-hidden border border-white/5">
                                <div className="aspect-[16/9] w-full bg-center bg-cover" style={{ backgroundImage: `url('${vehicle.image}')` }} />
                                <div className="p-4">
                                    <h4 className="font-bold text-sm text-[#F5F5F4]">{vehicle.name}</h4>
                                    <p className="text-xs text-slate-500">{vehicle.specs}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <Link href="/garage/add" className="flex-none w-72 snap-start">
                        <div className="h-full aspect-[16/9] flex flex-col items-center justify-center bg-[#0D0B14] rounded-xl border-2 border-dashed border-white/10">
                            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-slate-400">add</span>
                            </div>
                            <p className="font-bold text-sm text-slate-500">Add Vehicle</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Drives + Routes */}
            <section className="mt-8 px-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold tracking-tight text-[#F5F5F4]">Drives + Routes</h3>
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                        <Link href="/drives" className="text-[#8B5CF6]">Drives</Link>
                        <span className="text-slate-600">|</span>
                        <Link href="/routes" className="text-[#8B5CF6]">Routes</Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {MOCK_DRIVES.map(drive => (
                        <Link key={drive.id} href={`/drives/${drive.id}`} className="flex items-center gap-3 p-3 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="size-16 rounded-lg overflow-hidden bg-white/5">
                                <div className="size-full bg-cover bg-center" style={{ backgroundImage: `url('${drive.image}')` }} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-[#F5F5F4]">{drive.name}</h4>
                                <p className="text-xs text-slate-500">{drive.meta}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                    ))}
                    {MOCK_ROUTES.map(route => (
                        <Link key={route.id} href={`/routes/${route.id}`} className="flex items-center gap-3 p-3 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="size-16 rounded-lg overflow-hidden bg-white/5">
                                <div className="size-full bg-cover bg-center" style={{ backgroundImage: `url('${route.image}')` }} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-[#F5F5F4]">{route.name}</h4>
                                <p className="text-xs text-slate-500">{route.meta}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Activity Feed */}
            <section className="mt-8 px-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold tracking-tight text-[#F5F5F4]">Activity</h3>
                    <Link href="/activity" className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">View All</Link>
                </div>
                <div className="space-y-3">
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 p-3">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-[#8B5CF6]/15 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#8B5CF6] text-sm">route</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-white font-medium">Completed Cannonball Run</p>
                                <p className="text-xs text-slate-500">2,800 mi • Avg 78 mph</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500">Today</span>
                        </div>
                    </div>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 p-3">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-400 text-sm">garage</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-white font-medium">Added Rivian R1T</p>
                                <p className="text-xs text-slate-500">Quad-Motor • 835 hp</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500">Yesterday</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Settings + Privacy */}
            <section className="mt-8 px-6 mb-10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold tracking-tight text-[#F5F5F4]">Settings</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/settings" className="bg-[#0D0B14] rounded-xl border border-white/5 p-4">
                        <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Account</div>
                        <div className="text-sm font-bold text-white mt-2">Preferences</div>
                    </Link>
                    <Link href="/settings/privacy" className="bg-[#0D0B14] rounded-xl border border-white/5 p-4">
                        <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Privacy</div>
                        <div className="text-sm font-bold text-white mt-2">Security</div>
                    </Link>
                </div>
            </section>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
