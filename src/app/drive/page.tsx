'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { DriveNav } from '@/components/navigation';

interface DraggablePosition {
    x: number;
    y: number;
}

interface DragState {
    speed: DraggablePosition;
    leftStats: DraggablePosition;
    rightNav: DraggablePosition;
    backButton: DraggablePosition;
}

function useDraggable(initialPos: DraggablePosition) {
    const [position, setPosition] = useState(initialPos);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const elementStart = useRef({ x: 0, y: 0 });

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        dragStart.current = { x: touch.clientX, y: touch.clientY };
        elementStart.current = { ...position };
        setIsDragging(true);
    }, [position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.current.x;
        const deltaY = touch.clientY - dragStart.current.y;
        setPosition({
            x: elementStart.current.x + deltaX,
            y: elementStart.current.y + deltaY,
        });
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        dragStart.current = { x: e.clientX, y: e.clientY };
        elementStart.current = { ...position };
        setIsDragging(true);
    }, [position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        setPosition({
            x: elementStart.current.x + deltaX,
            y: elementStart.current.y + deltaY,
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    return {
        position,
        isDragging,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseUp,
        },
    };
}

export default function DrivePage() {
    const [isRecording, setIsRecording] = useState(false);

    // Draggable positions for each element
    const speed = useDraggable({ x: 0, y: 0 });
    const leftStats = useDraggable({ x: 0, y: 0 });
    const rightNav = useDraggable({ x: 0, y: 0 });
    const backButton = useDraggable({ x: 0, y: 0 });

    return (
        <div className="relative h-screen w-full bg-[#0D0B14] overflow-hidden">
            {/* Map Mesh Background (placeholder for Mapbox) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: '#0D0B14',
                    backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '100% 100%, 40px 40px, 40px 40px'
                }}
            />

            {/* Centered Speed Display - DRAGGABLE */}
            <div
                className="absolute top-0 left-0 right-0 pt-14 z-10 flex justify-center cursor-move"
                style={{ transform: `translate(${speed.position.x}px, ${speed.position.y}px)` }}
                {...speed.handlers}
            >
                <div className={`flex flex-col items-center transition-opacity ${speed.isDragging ? 'opacity-70' : ''}`}>
                    <span className="text-5xl font-black tracking-tighter italic text-[#EF4444]">--</span>
                    <span className="text-xs font-bold text-[#EF4444]/70 uppercase tracking-widest">MPH</span>
                </div>
            </div>

            {/* Left Stats Panel - DRAGGABLE */}
            <div
                className="absolute left-4 top-32 flex flex-col gap-3 z-10 cursor-move"
                style={{ transform: `translate(${leftStats.position.x}px, ${leftStats.position.y}px)` }}
                {...leftStats.handlers}
            >
                <div className={`bg-[rgba(13,11,20,0.7)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl p-3 w-28 flex flex-col transition-opacity ${leftStats.isDragging ? 'opacity-70' : ''}`}>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Time</span>
                    <span className="text-xl font-bold tracking-tight">00:00</span>
                </div>
                <div className={`bg-[rgba(13,11,20,0.7)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl p-3 w-28 flex flex-col transition-opacity ${leftStats.isDragging ? 'opacity-70' : ''}`}>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Dist</span>
                    <span className="text-xl font-bold tracking-tight">0.0 <span className="text-xs">mi</span></span>
                </div>
            </div>

            {/* Right Controls - Navigation - DRAGGABLE */}
            <div
                className="absolute right-4 top-32 flex flex-col gap-3 z-10 cursor-move"
                style={{ transform: `translate(${rightNav.position.x}px, ${rightNav.position.y}px)` }}
                {...rightNav.handlers}
            >
                <button className={`bg-[rgba(13,11,20,0.7)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] w-12 h-12 rounded-full flex items-center justify-center text-[#8B5CF6] transition-opacity ${rightNav.isDragging ? 'opacity-70' : ''}`}>
                    <span className="material-symbols-outlined">navigation</span>
                </button>
            </div>

            {/* Center User Marker */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-10 h-10 bg-[#EF4444]/40 rounded-full animate-ping" />
                    <div className="relative w-5 h-5 bg-[#EF4444] rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                    <div className="absolute -bottom-8 bg-black/60 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest border border-white/10">
                        You
                    </div>
                </div>
            </div>

            {/* Location Label */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-10">
                <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/5">
                    <p className="text-[10px] font-medium tracking-widest text-white/60 uppercase">
                        Waiting for location...
                    </p>
                </div>
            </div>

            {/* Recording indicator */}
            {isRecording && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 py-2 px-4 bg-[#EF4444]/10 text-[#EF4444] rounded-full border border-[#EF4444]/20">
                        <span className="size-2 rounded-full bg-[#EF4444] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Recording</span>
                    </div>
                </div>
            )}

            {/* Back Button - Bottom Right (replacing compass) - DRAGGABLE */}
            <div
                className="absolute bottom-28 right-4 z-10 cursor-move"
                style={{ transform: `translate(${backButton.position.x}px, ${backButton.position.y}px)` }}
                {...backButton.handlers}
            >
                <Link
                    href="/home"
                    className={`bg-[rgba(13,11,20,0.7)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] rounded-full p-3 w-14 h-14 flex items-center justify-center hover:bg-white/5 transition-all ${backButton.isDragging ? 'opacity-70' : 'opacity-60 hover:opacity-100'}`}
                    onClick={(e) => backButton.isDragging && e.preventDefault()}
                >
                    <span className="material-symbols-outlined text-[#F5F5F4] text-2xl">keyboard_return</span>
                </Link>
            </div>

            {/* Drive Mode Bottom Nav */}
            <DriveNav
                isRecording={isRecording}
                onRecordToggle={() => setIsRecording(!isRecording)}
            />
        </div>
    );
}
