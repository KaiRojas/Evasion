'use client';

import Link from 'next/link';

interface DriveNavProps {
    isRecording?: boolean;
    onRecordToggle?: () => void;
}

export function DriveNav({ isRecording = false, onRecordToggle }: DriveNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 flex justify-center">
            <div className="glass h-20 w-full max-w-md rounded-full px-2 grid grid-cols-5 items-center shadow-2xl relative bg-[rgba(13,11,20,0.7)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] mb-2">
                {/* Routes Button */}
                <button className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-xl">map</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Routes</span>
                </button>

                {/* Timer Button - Performance Timing */}
                <button className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-xl">timer</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Sprint</span>
                </button>

                {/* Center Record Button */}
                <div className="relative flex justify-center items-center">
                    <div className="absolute -top-12">
                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-[#EF4444]/20 rounded-full blur-xl" />

                        <button
                            onClick={onRecordToggle}
                            className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-[#0D0B14] active:scale-95 transition-all z-10 ${isRecording
                                ? 'bg-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                                : 'bg-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {isRecording ? 'stop' : 'radio_button_checked'}
                            </span>
                            <span className="text-[9px] font-bold mt-0.5 tracking-widest text-white">
                                {isRecording ? 'STOP' : 'REC'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Marker Button */}
                <button className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-xl">push_pin</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Marker</span>
                </button>

                {/* Settings Button */}
                <button className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-xl">settings</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
                </button>
            </div>
        </nav>
    );
}
