'use client';

import Link from 'next/link';
import { useSettings } from '@/lib/settings';

export default function PrivacySettingsPage() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4]">
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/settings" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold">Privacy & Security</h1>
                    <div className="size-10" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-6 space-y-8">
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Data & Privacy</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-bold text-sm text-white">Share Driving Data</h3>
                                <p className="text-xs text-slate-500 mt-1">Allow anonymous data usage for heatmap</p>
                            </div>
                            <button
                                onClick={() => updateSetting('shareData', !settings.shareData)}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.shareData ? 'bg-[#8B5CF6]' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.shareData ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-bold text-sm text-white">Location Services</h3>
                                <p className="text-xs text-slate-500 mt-1">Precise location for navigation</p>
                            </div>
                            <button
                                onClick={() => updateSetting('locationServices', !settings.locationServices)}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.locationServices ? 'bg-[#8B5CF6]' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.locationServices ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Security</h2>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="font-medium">Change Password</span>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="font-medium">Two-Factor Authentication</span>
                            <span className="text-xs text-[#8B5CF6] font-bold">Enabled</span>
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Data Management</h2>
                    <button className="w-full p-4 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors mb-4">
                        Download My Data
                    </button>
                    <button className="w-full p-4 border border-red-500/20 bg-red-500/5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                        Delete Account
                    </button>
                </section>
            </main>
        </div>
    );
}
