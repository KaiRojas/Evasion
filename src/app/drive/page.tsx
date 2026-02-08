'use client';


import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { UserLocationMarker } from '@/components/map/UserLocationMarker';

const BaseMap = dynamic(() => import('@/components/map/BaseMap').then(mod => mod.BaseMap), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-[#0D0B14] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full" />
        </div>
    )
});
import { useGeolocation, useDataRecorder, useWakeLock } from '@/hooks';
import { useLocationStore } from '@/stores';
import { DriveNav } from '@/components/navigation';
import { SettingsPopup } from '@/components/navigation/SettingsPopup';
import { RoutesSheet } from '@/components/navigation/RoutesSheet';
import { MarkerPopup } from '@/components/navigation/MarkerPopup';
import { Plus, Minus, X } from 'lucide-react';

// iOS-style jiggle animation
const JIGGLE_STYLE = `
  @keyframes jiggle {
    0% { transform: rotate(-1deg); }
    50% { transform: rotate(1.5deg); }
    100% { transform: rotate(-1deg); }
  }
  .animate-jiggle {
    animation: jiggle 0.25s infinite;
  }
`;

interface DraggablePosition {
    x: number;
    y: number;
}

interface DragState {
    speed: DraggablePosition;
    timeCard: DraggablePosition;
    distanceCard: DraggablePosition;
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
    const { location, heading, speed: currentSpeed } = useGeolocation({ watchPosition: true, enableHighAccuracy: true });
    const [isRecording, setIsRecording] = useState(false);
    const [simulate, setSimulate] = useState(false); // New Simulation state
    const { stats, points, requestPermissions, sensorsActive } = useDataRecorder(isRecording, simulate); // Pass simulate flag
    useWakeLock(true); // Keep screen on whenever in Drive Mode
    const [hiddenCards, setHiddenCards] = useState({ time: false, distance: false });
    const [highContrastCards, setHighContrastCards] = useState({ time: false, distance: false });
    const [isEditMode, setIsEditMode] = useState(false);
    const [statsMenuOpen, setStatsMenuOpen] = useState(false);
    const [activePopup, setActivePopup] = useState<'settings' | 'routes' | 'marker' | null>(null);
    const [markerPosition, setMarkerPosition] = useState<{ x: number, y: number } | null>(null);
    const [followResetKey, setFollowResetKey] = useState(0);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const longPressStartRef = useRef<{ x: number; y: number; id: number | null } | null>(null);

    // Draggable positions for each element
    const speed = useDraggable({ x: 0, y: 0 });
    const timeCard = useDraggable({ x: 0, y: 0 });
    const distanceCard = useDraggable({ x: 0, y: 0 });
    const rightNav = useDraggable({ x: 0, y: 0 });
    const backButton = useDraggable({ x: 0, y: 0 });

    const hideCard = useCallback((key: 'time' | 'distance') => {
        setHiddenCards(prev => ({ ...prev, [key]: true }));
    }, []);

    const toggleCard = useCallback((key: 'time' | 'distance', visible: boolean) => {
        setHiddenCards(prev => ({ ...prev, [key]: !visible }));
    }, []);

    const toggleHighContrast = useCallback((key: 'time' | 'distance') => {
        if (isEditMode) return; // Don't toggle style in edit mode
        setHighContrastCards(prev => ({ ...prev, [key]: !prev[key] }));
    }, [isEditMode]);

    const handleSnapToUser = useCallback(() => {
        if (!location) return;
        setFollowResetKey(Date.now());
    }, [location]);

    // Auto-center on load (one-time snap when location available)
    useEffect(() => {
        if (location && followResetKey === 0) {
            setFollowResetKey(Date.now());
        }
    }, [location, followResetKey]);

    const handleMapClick = useCallback((lng: number, lat: number, x: number, y: number) => {
        if (isEditMode) return;

        // If marker popup is already open, deselect (close it)
        if (activePopup === 'marker') {
            setActivePopup(null);
            setMarkerPosition(null);
        } else {
            // Otherwise open it at new location
            setMarkerPosition({ x, y });
            setActivePopup('marker');
        }
    }, [isEditMode, activePopup]);

    const clearLongPress = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const enterEditMode = useCallback(() => {
        setIsEditMode(true);
    }, []);

    const handleRootPointerDown = useCallback((e: React.PointerEvent) => {
        if (e.pointerType === 'touch') {
            longPressStartRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
            clearLongPress();
            longPressTimerRef.current = setTimeout(() => {
                enterEditMode();
            }, 500);
        } else {
            if (e.detail >= 2) {
                enterEditMode();
            }
        }
    }, [clearLongPress, enterEditMode]);

    const handleRootPointerMove = useCallback((e: React.PointerEvent) => {
        const start = longPressStartRef.current;
        if (!start || start.id !== e.pointerId) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > 8) {
            clearLongPress();
        }
    }, [clearLongPress]);

    const handleRootPointerUp = useCallback((e: React.PointerEvent) => {
        const start = longPressStartRef.current;
        if (start && start.id === e.pointerId) {
            clearLongPress();
            longPressStartRef.current = null;
        }
    }, [clearLongPress]);

    const handleRootPointerCancel = useCallback(() => {
        clearLongPress();
        longPressStartRef.current = null;
    }, [clearLongPress]);

    const handleRootDoubleClick = useCallback(() => {
        enterEditMode();
    }, [enterEditMode]);

    return (
        <div
            className="relative h-screen w-full bg-[#0D0B14] overflow-hidden"
            onPointerDownCapture={handleRootPointerDown}
            onPointerMoveCapture={handleRootPointerMove}
            onPointerUpCapture={handleRootPointerUp}
            onPointerCancelCapture={handleRootPointerCancel}
            onDoubleClickCapture={handleRootDoubleClick}
        >
            <style>{JIGGLE_STYLE}</style>

            {/* Map Background */}
            <div className="absolute inset-0">
                {/* DEBUG OVERLAY - REMOVE AFTER FIX */}
                <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 9999, background: 'red', color: 'white', padding: '4px', fontSize: '10px' }}>
                    DEBUG: Token Length: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.length || 0} |
                    Prefix: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.substring(0, 5) || 'NONE'}
                </div>
                <BaseMap
                    viewState={location ? {
                        longitude: location.longitude,
                        latitude: location.latitude,
                        zoom: 17, // Closer zoom for driving
                        pitch: 60, // Tilted view
                        bearing: heading || 0, // Follow heading
                        padding: { top: 0, bottom: 120, left: 0, right: 0 } // Offset center to bottom
                    } : undefined}
                    followUser={true}
                    followResumeMs={5000}
                    followResetKey={followResetKey}
                    initialZoom={15}
                    initialPitch={60}
                    hideControls={true}
                    mapStyle="mapbox://styles/mapbox/navigation-night-v1" // Navigation style
                    onClick={handleMapClick}
                    routeTrace={points.map(p => [p.coords.longitude, p.coords.latitude])}
                >
                    <UserLocationMarker location={location} />
                    {/* Traffic/Police Layers would go here */}
                </BaseMap>
            </div>

            {/* Centered Speed Display - DRAGGABLE */}
            <div
                className="absolute top-0 left-0 right-0 pt-14 z-10 flex justify-center cursor-move"
                style={{ transform: `translate(${speed.position.x}px, ${speed.position.y}px)` }}
                {...speed.handlers}
            >
                <div className={`flex flex-col items-center transition-opacity ${speed.isDragging ? 'opacity-70' : ''}`}>
                    <span className="text-5xl font-black tracking-tighter italic text-[#EF4444]">
                        {currentSpeed ? (currentSpeed < 3 ? 0 : Math.round(currentSpeed)) : '--'}
                    </span>
                    <span className="text-xs font-bold text-[#EF4444]/70 uppercase tracking-widest">MPH</span>
                </div>
            </div>

            {!hiddenCards.time && (
                <div
                    className="absolute left-4 top-32 z-10 cursor-move"
                    style={{ transform: `translate(${timeCard.position.x}px, ${timeCard.position.y}px)` }}
                    {...timeCard.handlers}
                    onClick={() => toggleHighContrast('time')}
                >
                    <div
                        className={`relative rounded-xl p-2 w-24 flex flex-col transition-all ${timeCard.isDragging ? 'opacity-70' : ''} ${isEditMode ? 'animate-jiggle' : ''}
                        ${highContrastCards.time
                                ? 'bg-transparent'
                                : 'bg-[#0D0B14]/95 backdrop-blur-xl border border-white/10'
                            }`}
                    >
                        {isEditMode && (
                            <button
                                className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg z-20 hover:bg-red-600 transition-colors"
                                onClick={(e) => { e.stopPropagation(); hideCard('time'); }}
                            >
                                <Minus size={14} strokeWidth={3} />
                            </button>
                        )}
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${highContrastCards.time ? 'text-[#22c55e]' : 'text-white/50'}`}>Time</span>
                        <span className={`text-xl font-bold tracking-tight ${highContrastCards.time ? 'text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}`}>00:00</span>
                    </div>
                </div>
            )}

            {!hiddenCards.distance && (
                <div
                    className="absolute left-4 top-56 z-10 cursor-move"
                    style={{ transform: `translate(${distanceCard.position.x}px, ${distanceCard.position.y}px)` }}
                    {...distanceCard.handlers}
                    onClick={() => toggleHighContrast('distance')}
                >
                    <div
                        className={`relative rounded-xl p-2 w-24 flex flex-col transition-all ${distanceCard.isDragging ? 'opacity-70' : ''} ${isEditMode ? 'animate-jiggle' : ''}
                        ${highContrastCards.distance
                                ? 'bg-transparent'
                                : 'bg-[#0D0B14]/95 backdrop-blur-xl border border-white/10'
                            }`}
                    >
                        {isEditMode && (
                            <button
                                className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg z-20 hover:bg-red-600 transition-colors"
                                onClick={(e) => { e.stopPropagation(); hideCard('distance'); }}
                            >
                                <Minus size={14} strokeWidth={3} />
                            </button>
                        )}
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${highContrastCards.distance ? 'text-[#22c55e]' : 'text-white/50'}`}>Dist</span>
                        <span className={`text-xl font-bold tracking-tight ${highContrastCards.distance ? 'text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}`}>0.0 <span className="text-xs">mi</span></span>
                    </div>
                </div>
            )}

            {/* Navigation - DRAGGABLE (Bottom Left) */}
            <div
                className="absolute left-4 bottom-28 flex flex-col gap-3 z-10 cursor-move"
                style={{ transform: `translate(${rightNav.position.x}px, ${rightNav.position.y}px)` }}
                {...rightNav.handlers}
            >
                <button
                    className={`bg-[rgba(13,11,20,0.7)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] w-12 h-12 rounded-full flex items-center justify-center text-[#8B5CF6] transition-opacity ${rightNav.isDragging ? 'opacity-70' : ''}`}
                    onClick={handleSnapToUser}
                    title="Snap to my location"
                >
                    <span className="material-symbols-outlined">navigation</span>
                </button>
            </div>

            {/* Location Label */}
            {!location && (
                <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-10">
                    <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/5">
                        <p className="text-[10px] font-medium tracking-widest text-white/60 uppercase">
                            Waiting for location...
                        </p>
                    </div>
                </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 py-2 px-4 bg-[#EF4444]/10 text-[#EF4444] rounded-full border border-[#EF4444]/20 backdrop-blur-md">
                        <span className="size-2 rounded-full bg-[#EF4444] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider">REC {stats.pointCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono tracking-tight">
                        <span className="text-white/40">{stats.fileSizeKB}KB</span>
                        {sensorsActive && (
                            <span className="flex items-center gap-1 text-green-400">
                                <span className="size-1 rounded-full bg-green-400" />
                                MEMS
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Back Button - Top Left - DRAGGABLE */}
            <div
                className="absolute top-4 left-4 z-10 cursor-move"
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
                onRecordToggle={async () => {
                    if (!isRecording) {
                        // Request permissions before starting
                        await requestPermissions();
                    }
                    setIsRecording(!isRecording);
                }}
                onSettingsClick={() => setActivePopup(activePopup === 'settings' ? null : 'settings')}
                onRoutesClick={() => setActivePopup(activePopup === 'routes' ? null : 'routes')}
                onMarkerClick={() => {
                    setMarkerPosition(null); // Reset position for bottom popup
                    setActivePopup(activePopup === 'marker' ? null : 'marker');
                }}
            />

            {/* Popups */}
            <SettingsPopup
                isOpen={activePopup === 'settings'}
                onClose={() => setActivePopup(null)}
                simulate={simulate} // Pass state
                setSimulate={setSimulate} // Pass setter
            />
            <MarkerPopup
                isOpen={activePopup === 'marker'}
                onClose={() => setActivePopup(null)}
                position={markerPosition}
            />
            <RoutesSheet
                isOpen={activePopup === 'routes'}
                onClose={() => setActivePopup(null)}
            />

            {/* Debug: edit mode indicator - REMOVED */}{/* 
            {isEditMode && (
                <div className="absolute top-4 right-4 z-30 px-2 py-1 rounded-full bg-red-500/80 text-white text-[10px] uppercase tracking-widest">
                    Edit Mode
                </div>
            )} 
            */}

            {/* Edit Mode: Top Center Controls (Dynamic Island Area) */}
            {isEditMode && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-lg hover:bg-white/20 transition-all"
                        onClick={() => setStatsMenuOpen(true)}
                    >
                        <Plus size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Add Widget</span>
                    </button>

                    <button
                        className="px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider shadow-lg"
                        onClick={() => setIsEditMode(false)}
                    >
                        Done
                    </button>
                </div>
            )}

            {/* Stats Store Popup */}
            {statsMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#0D0B14] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">Add Widget</h3>
                            <button
                                onClick={() => setStatsMenuOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-3">
                            <button
                                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${!hiddenCards.time
                                    ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                    }`}
                                onClick={() => {
                                    if (hiddenCards.time) {
                                        toggleCard('time', true);
                                        setStatsMenuOpen(false);
                                    }
                                }}
                                disabled={!hiddenCards.time}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white">Time</div>
                                    <div className="text-[10px] text-white/50">Current time</div>
                                </div>
                            </button>

                            <button
                                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${!hiddenCards.distance
                                    ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                    }`}
                                onClick={() => {
                                    if (hiddenCards.distance) {
                                        toggleCard('distance', true);
                                        setStatsMenuOpen(false);
                                    }
                                }}
                                disabled={!hiddenCards.distance}
                            >
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <span className="material-symbols-outlined text-lg">straighten</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white">Distance</div>
                                    <div className="text-[10px] text-white/50">Trip distance</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
