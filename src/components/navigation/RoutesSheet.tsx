import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';

interface RoutesSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RoutesSheet({ isOpen, onClose }: RoutesSheetProps) {
    const [height, setHeight] = useState<'half' | 'full'>('half');
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setHeight('half');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
        currentY.current = startY.current;
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const delta = y - startY.current;

        // Simple distinct logic: dragging down from half closes, dragging up expands
        if (delta > 100 && height === 'half') onClose();
        if (delta < -50 && height === 'half') setHeight('full');
        if (delta > 100 && height === 'full') setHeight('half');
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-40 flex flex-col justify-end pointer-events-none">
            {/* Dim Overlay */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className={`relative w-full bg-[#0D0B14] rounded-t-[32px] border-t border-white/10 shadow-2xl pointer-events-auto transition-all duration-300 ease-out flex flex-col ${height === 'half' ? 'h-[50vh]' : 'h-[92vh]'
                    }`}
            >
                {/* Drag Handle */}
                <div
                    className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-white/5"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleTouchStart}
                    onMouseMove={handleTouchMove}
                    onMouseUp={handleTouchEnd}
                >
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 content-start">
                    {/* Search */}
                    <Input
                        placeholder="Search routes..."
                        className="bg-white/5 border-white/10 mb-6"
                    />

                    {/* Quick Access */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-[#8B5CF6]">home</span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">Home</div>
                                <div className="text-[10px] text-white/50">25 min</div>
                            </div>
                        </button>
                        <button className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-[#8B5CF6]">work</span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">Work</div>
                                <div className="text-[10px] text-white/50">14 min</div>
                            </div>
                        </button>
                    </div>

                    {/* Recent Routes */}
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Recent</h3>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                    <span className="material-symbols-outlined">history</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">Downtown Loop</div>
                                    <div className="text-xs text-white/50">4.2 miles • 12 mins ago</div>
                                </div>
                                <span className="material-symbols-outlined text-white/20">chevron_right</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
