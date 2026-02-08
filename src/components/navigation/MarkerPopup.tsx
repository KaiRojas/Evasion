import { DrivePopup } from './DrivePopup';

interface MarkerPopupProps {
    isOpen: boolean;
    onClose: () => void;
    position?: { x: number; y: number } | null;
}

const MARKERS = [
    { label: 'Police', icon: 'local_police', color: 'text-blue-500', bg: 'bg-blue-500/20' },
    { label: 'Hazard', icon: 'warning', color: 'text-orange-500', bg: 'bg-orange-500/20' },
    { label: 'Camera', icon: 'speed', color: 'text-purple-500', bg: 'bg-purple-500/20' },
    { label: 'Traffic', icon: 'traffic', color: 'text-red-500', bg: 'bg-red-500/20' },
    { label: 'Accident', icon: 'car_crash', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    { label: 'Closure', icon: 'block', color: 'text-gray-500', bg: 'bg-gray-500/20' },
];

export function MarkerPopup({ isOpen, onClose, position }: MarkerPopupProps) {
    return (
        <DrivePopup isOpen={isOpen} onClose={onClose} arrowOffset={85} position={position}> {/* 85px offset for Marker icon position */}
            <div className="w-full p-4 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex gap-4 min-w-max px-2">
                    {MARKERS.map((marker) => (
                        <button
                            key={marker.label}
                            className="flex flex-col items-center gap-2 group w-16"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${marker.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95`}>
                                <span className={`material-symbols-outlined text-2xl ${marker.color}`}>
                                    {marker.icon}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">
                                {marker.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </DrivePopup>
    );
}
