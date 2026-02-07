'use client';

import Link from 'next/link';
import { useSettings } from '@/lib/settings';

export default function PreferencesPage() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4]">
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/settings" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold">Preferences</h1>
                    <div className="size-10" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-6 space-y-8">
                {/* Units */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Units & Display</h2>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">speed</span>
                                <span className="font-medium">Speed Units</span>
                            </div>
                            <div className="flex bg-black/40 rounded-lg p-1">
                                <button
                                    onClick={() => updateSetting('units', 'imperial')}
                                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${settings.units === 'imperial' ? 'bg-[#8B5CF6] text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    MPH
                                </button>
                                <button
                                    onClick={() => updateSetting('units', 'metric')}
                                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${settings.units === 'metric' ? 'bg-[#8B5CF6] text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    KM/H
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">straighten</span>
                                <span className="font-medium">Distance</span>
                            </div>
                            <div className="flex bg-black/40 rounded-lg p-1">
                                <button
                                    onClick={() => updateSetting('units', 'imperial')}
                                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${settings.units === 'imperial' ? 'bg-[#8B5CF6] text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Miles
                                </button>
                                <button
                                    onClick={() => updateSetting('units', 'metric')}
                                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${settings.units === 'metric' ? 'bg-[#8B5CF6] text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    KM
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* App Theme */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Appearance</h2>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">dark_mode</span>
                                <span className="font-medium">Theme</span>
                            </div>
                            <span className="text-sm text-slate-400">Dark (Default)</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">map</span>
                                <span className="font-medium">Map Style</span>
                            </div>
                            <select
                                value={settings.mapStyle}
                                onChange={(e) => updateSetting('mapStyle', e.target.value as 'midnight' | 'satellite' | 'streets')}
                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                            >
                                <option value="midnight">Midnight</option>
                                <option value="satellite">Satellite</option>
                                <option value="streets">Streets</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Notifications</h2>
                    <div className="bg-[#0D0B14] rounded-xl border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">notifications_active</span>
                                <span className="font-medium">Push Notifications</span>
                            </div>
                            <button
                                onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.pushNotifications ? 'bg-[#8B5CF6]' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#8B5CF6]">mail</span>
                                <span className="font-medium">Email Updates</span>
                            </div>
                            <button
                                onClick={() => updateSetting('emailUpdates', !settings.emailUpdates)}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.emailUpdates ? 'bg-[#8B5CF6]' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.emailUpdates ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
