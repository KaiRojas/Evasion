'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/home" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold">Settings</h1>
                    <div className="size-10" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-6">
                {/* Account Section */}
                <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Account</h2>
                    <div className="space-y-2">
                        <Link
                            href="/profile/edit"
                            className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">person</span>
                                <span className="font-medium">Edit Profile</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                        <Link
                            href="/garage"
                            className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">directions_car</span>
                                <span className="font-medium">My Garage</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                        <Link
                            href="/settings/privacy"
                            className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">lock</span>
                                <span className="font-medium">Privacy & Security</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Preferences</h2>
                    <div className="space-y-2">
                        <Link
                            href="/settings/preferences"
                            className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">tune</span>
                                <span className="font-medium">App Preferences</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Units, Theme</span>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* About Section */}
                <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">About</h2>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">help</span>
                                <span className="font-medium">Help & Support</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>
                        <Link
                            href="/legal/terms"
                            className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">description</span>
                                <span className="font-medium">Terms of Service</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                        <Link
                            href="/legal/privacy"
                            className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">policy</span>
                                <span className="font-medium">Privacy Policy</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </Link>
                        <div className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">info</span>
                                <span className="font-medium">Version</span>
                            </div>
                            <span className="text-sm text-slate-400">1.0.0 (Beta)</span>
                        </div>
                    </div>
                </section>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold hover:bg-red-500/20 transition-colors"
                >
                    Sign Out
                </button>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">Made with ⚡ by the EVASION team</p>
                </div>
            </main>
        </div>
    );
}
