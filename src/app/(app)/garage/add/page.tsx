'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddVehiclePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/garage');
    };

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4] pb-24">
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/garage" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">close</span>
                    </Link>
                    <h1 className="text-lg font-bold">Add Vehicle</h1>
                    <button
                        type="submit"
                        form="add-vehicle-form"
                        disabled={isSubmitting}
                        className="text-[#8B5CF6] font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-6">
                <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Vehicle Details</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Year</label>
                                <input type="number" placeholder="2024" className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-white outline-none focus:border-[#8B5CF6]" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Make</label>
                                <input type="text" placeholder="Porsche" className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-white outline-none focus:border-[#8B5CF6]" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Model</label>
                            <input type="text" placeholder="911" className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-white outline-none focus:border-[#8B5CF6]" required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Trim / Variant</label>
                            <input type="text" placeholder="GT3 Touring" className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-white outline-none focus:border-[#8B5CF6]" />
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Specs (Optional)</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Engine</label>
                                <input type="text" placeholder="4.0L Flat-6" className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-white outline-none focus:border-[#8B5CF6]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Power</label>
                                <input type="text" placeholder="502 hp" className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-white outline-none focus:border-[#8B5CF6]" />
                            </div>
                        </div>
                    </div>

                    {/* Modifications */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Modifications</h2>
                            <button type="button" className="text-xs text-[#8B5CF6] font-bold">+ Add Mod</button>
                        </div>
                        <div className="p-4 bg-[#0D0B14] rounded-xl border border-white/5 text-center text-slate-500 text-sm">
                            List your aftermarket parts here
                        </div>
                    </div>

                    {/* Photo Upload Placeholder */}
                    <div className="pt-6 border-t border-white/5">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Photos</label>
                        <div className="aspect-video w-full rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">add_a_photo</span>
                            <span className="text-sm text-slate-400 font-medium">Upload Cover Photo</span>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
