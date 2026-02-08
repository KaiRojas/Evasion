import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DrivePopupProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    arrowOffset?: number; // Offset from right
    position?: { x: number; y: number } | null;
}

export function DrivePopup({ isOpen, onClose, children, arrowOffset = 24, position }: DrivePopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
            {/* Dim Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />

            {/* Popup Content */}
            <div className="relative w-full px-6 pb-28 pointer-events-auto flex flex-col items-center">
                <style>{`
                    @keyframes slideUpFade {
                        from { opacity: 0; transform: translateY(10px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .pop-out-animation {
                        animation: slideUpFade 0.2s ease-out forwards;
                    }
                `}</style>

                <div
                    ref={popupRef}
                    className="relative w-full max-w-sm pop-out-animation"
                >
                    <div className="w-full bg-white dark:bg-[#0D0B14] rounded-2xl border border-slate-200 dark:border-[#8B5CF6]/20 shadow-2xl overflow-hidden relative z-10">
                        {children}
                    </div>

                    {/* Arrow */}
                    <div
                        className="absolute -bottom-2 w-4 h-4 bg-white dark:bg-[#0D0B14] border-r border-b border-slate-200 dark:border-[#8B5CF6]/20 rotate-45 z-20 shadow-lg"
                        style={{
                            right: `${arrowOffset}px`
                        }}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
