'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks';

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
        <div className="flex flex-col pb-8">
            {/* Settings Icon - Top Left */}
            <div className="px-4 pt-2">
                <Link href="/settings" className="inline-flex p-2 hover:bg-white/5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-[#F5F5F4]">settings</span>
                </Link>
            </div>

            {/* User Header Profile Section */}
            <section className="flex flex-col items-center px-6 pt-2 pb-4">
                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="size-32 rounded-full p-1.5 bg-gradient-to-tr from-[#8B5CF6] to-purple-400">
                        <div
                            className="size-full rounded-full bg-[#06040A] border-4 border-[#06040A] overflow-hidden bg-center bg-cover"
                            style={{
                                backgroundImage: displayUser.avatarUrl ? `url('${displayUser.avatarUrl}')` : 'none',
                                backgroundColor: displayUser.avatarUrl ? 'transparent' : '#1a1a2e'
                            }}
                        >
                            {!displayUser.avatarUrl && (
                                <div className="size-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-white/30">person</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {displayUser.isVerified && (
                        <div className="absolute bottom-1 right-1 size-8 bg-[#8B5CF6] rounded-full flex items-center justify-center border-4 border-[#06040A]">
                            <span className="material-symbols-outlined text-white text-xs">verified</span>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F4]">{displayUser.name}</h2>
                    <p className="text-slate-400 font-medium">@{displayUser.username}</p>
                    <p className="mt-2 text-slate-300 text-sm max-w-[240px]">{displayUser.bio}</p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-4 w-full mb-6">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-bold text-[#F5F5F4]">{displayUser.stats.drives}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Drives</span>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-bold text-[#F5F5F4]">{displayUser.stats.distance}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Distance</span>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-bold text-[#F5F5F4]">{displayUser.stats.friends}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Friends</span>
                    </div>
                </div>

                {/* Edit Profile Button */}
                <button className="w-full py-3 rounded-full border border-white/20 font-bold text-sm tracking-wide hover:bg-white/5 transition-colors text-[#F5F5F4]">
                    EDIT PROFILE
                </button>
            </section>

            {/* My Garage Section */}
            <section className="mt-8">
                <div className="flex items-center justify-between px-6 mb-4">
                    <h3 className="text-lg font-bold tracking-tight text-[#F5F5F4]">My Garage</h3>
                    <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider cursor-pointer">View All</span>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 pb-4 hide-scrollbar snap-x snap-mandatory">
                    {/* Vehicle Card 1 */}
                    <div className="flex-none w-72 snap-start">
                        <div className="bg-[#0D0B14] rounded-xl overflow-hidden border border-white/5 shadow-xl">
                            <div
                                className="aspect-[16/9] w-full bg-center bg-cover"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1wk9qW328j6wIlIEut1DmWx98EPHDEy1XIOgRxZXt0KqAPjsn3E6F2yYWNKpwOHJMi1_D63rcC-BSoCXYa09NQWRwIRh3CMD4SeEJ2LrHdbx-KRFb-20FgsepH8jkd3nVXfWwlzgn_PfFsP4Gilq04Qt0E7hUAAlZtlxnTuGSbKePc_zeLkGgX5taNtOBsdHmBfVhFs2N3E5T6AeMszalBa-Ht_rgJrIh6_SWtYWumPqLrgP2oMhDK5jNRhj3IRq6a0qLmoJ3Tlc')" }}
                            />
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-[#F5F5F4]">2022 Porsche 911 GT3</h4>
                                    <p className="text-xs text-slate-500 uppercase tracking-tighter">Porsche • 4.0L Flat-6</p>
                                </div>
                                <span className="material-symbols-outlined text-[#8B5CF6]">speed</span>
                            </div>
                        </div>
                    </div>

                    {/* Add Vehicle Card */}
                    <div className="flex-none w-72 snap-start">
                        <div className="h-full aspect-[16/9] flex flex-col items-center justify-center bg-[#0D0B14] rounded-xl border-2 border-dashed border-white/10 group cursor-pointer transition-all hover:border-[#8B5CF6]/50">
                            <div className="size-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-[#8B5CF6]/20 transition-colors">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#8B5CF6] transition-colors">add</span>
                            </div>
                            <p className="font-bold text-sm text-slate-500 group-hover:text-white transition-colors">Add Vehicle</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="mt-8 px-6">
                <h3 className="text-lg font-bold tracking-tight mb-4 text-[#F5F5F4]">Achievements</h3>
                <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar py-2">
                    {/* Night Owl */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-16 rounded-full bg-[#0D0B14] flex items-center justify-center border-2 border-[#8B5CF6]/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                            <span className="material-symbols-outlined text-[#8B5CF6] text-3xl">dark_mode</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Night Owl</span>
                    </div>
                    {/* Centurion */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-16 rounded-full bg-[#0D0B14] flex items-center justify-center border-2 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">star_rate</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Centurion</span>
                    </div>
                    {/* Explorer */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-16 rounded-full bg-[#0D0B14] flex items-center justify-center border-2 border-emerald-500/40">
                            <span className="material-symbols-outlined text-emerald-500 text-3xl">route</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Explorer</span>
                    </div>
                    {/* Champion (locked) */}
                    <div className="flex flex-col items-center gap-2 opacity-40 grayscale">
                        <div className="size-16 rounded-full bg-[#0D0B14] flex items-center justify-center border-2 border-slate-500/40">
                            <span className="material-symbols-outlined text-slate-500 text-3xl">trophy</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Champion</span>
                    </div>
                </div>
            </section>

            {/* Recent Drives Section */}
            <section className="mt-8 px-6 mb-12">
                <h3 className="text-lg font-bold tracking-tight mb-4 text-[#F5F5F4]">Recent Drives</h3>
                <div className="space-y-4">
                    {/* Activity Item 1 */}
                    <Link href="/drives/1" className="flex items-center gap-4 p-3 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                            <div
                                className="size-full bg-cover bg-center"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJSnj3P_9XHu_BROzhM3E6VyP1L4gPTqfhqRDh2smvuqaQegnbEpdNGl2IPsgneTIJTSWysjGnFrfp6CqT3dRaCdsjMgf_KhLX2E7vZsw7AL-K1bakD1kh2RRNrpR9mJmRwcNAkz8gMROkz6aedBMQKwTLmu_6TiIv8ayonF0KUg-5rz6QrrjzWHHApYAjdlEOMUa-vL7G-dhpMuzCH2ZUA2TOX9PuqSIEDkYIRJglg5brhkssx9W8blVeiEUMN9jQmMn3J2o0eBU')" }}
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-[#F5F5F4]">Canyon Run: Malibu</h4>
                            <p className="text-xs text-slate-500">24.2 mi • 42 mins • Avg 45 mph</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </Link>

                    {/* Activity Item 2 */}
                    <Link href="/drives/2" className="flex items-center gap-4 p-3 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                            <div
                                className="size-full bg-cover bg-center"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQSWB2rnhnJdSBEUwELimNGip-W60z0eKgkmtyQCiwqT00gNqIjZ6Th6EeOnLIz1Lx5TC4c1qfA0PEe1qN2ed9xDAyUMtXu3pth5f5LJTTTu2-Hb6JZxqdZVmtx3ziZk1Vb6OxGAhksSJQIlcjnLVBHX62wQEIscobeiGjtXD54D7Fs97JpJQmvWkHgyRZCutdllaQEpbfXRlm-DVmOnyN-nh2SPrzAkSgTfU5WG5QiP4Z-rIzwt-EWsz54QkY15stdiyMrN-ByHQ')" }}
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-[#F5F5F4]">Midnight Loop</h4>
                            <p className="text-xs text-slate-500">12.5 mi • 18 mins • Avg 52 mph</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </Link>
                </div>
            </section>

            {/* Hide scrollbar styles */}
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
