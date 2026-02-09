'use client';

import Link from 'next/link';

interface DriveNavProps {
    isRecording?: boolean;
    onRecordToggle?: () => void;
    onSettingsClick?: () => void;
    onRoutesClick?: () => void;
    onMarkerClick?: () => void;
}

export function DriveNav({
    isRecording = false,
    onRecordToggle,
    onSettingsClick,
    onRoutesClick,
    onMarkerClick
}: DriveNavProps) {
    // Helper for haptic feedback
    const handleHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); // Light tap
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 flex justify-center pb-6">
            <div className="glass h-24 w-full max-w-lg rounded-full px-4 grid grid-cols-5 items-center shadow-2xl relative bg-[rgba(13,11,20,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.15)]">
                {/* Routes Button */}
                <button
                    className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => { handleHaptic(); onRoutesClick?.(); }}
                >
                    <span className="material-symbols-outlined text-xl">map</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Routes</span>
                </button>

                {/* Timer Button - Performance Timing */}
                <button
                    className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={handleHaptic}
                >
                    <span className="material-symbols-outlined text-xl">timer</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Sprint</span>
                </button>

                {/* Center Record Button */}
                <div className="flex justify-center items-center">
                    <div className="relative">
                        {/* Glow effect */}
                        {isRecording && <div className="absolute -inset-2 bg-[#EF4444]/20 rounded-full blur-xl" />}

                        <button
                            onClick={() => { handleHaptic(); onRecordToggle?.(); }}
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center border-[3px] border-[#0D0B14] active:scale-95 transition-all z-10 ${isRecording
                                ? 'bg-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                : 'bg-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                }`}
                        >
                            <div className={`rounded-full bg-white transition-all ${isRecording ? 'size-3 rounded-[2px]' : 'size-3'}`} />
                        </button>
                    </div>
                </div>

                {/* Marker Button */}
                <button
                    className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => { handleHaptic(); onMarkerClick?.(); }}
                >
                    <span className="material-symbols-outlined text-xl">push_pin</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Marker</span>
                </button>

                {/* Settings Button */}
                <button
                    className="flex flex-col items-center justify-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => { handleHaptic(); onSettingsClick?.(); }}
                >
                    <span className="material-symbols-outlined text-xl">settings</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
                </button>
            </div>
        </nav>
    );
}
