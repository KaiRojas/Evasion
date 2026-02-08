import { DrivePopup } from './DrivePopup';

interface SettingsPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsPopup({ isOpen, onClose }: SettingsPopupProps) {
    return (
        <DrivePopup isOpen={isOpen} onClose={onClose} arrowOffset={32}>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-[#F5F5F4] group-hover:text-[#8B5CF6] transition-colors">
                        <span className="material-symbols-outlined">dark_mode</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-[#F5F5F4]">Theme</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Dark</span>
                    <span className="material-symbols-outlined text-zinc-400 text-lg">chevron_right</span>
                </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-[#F5F5F4] group-hover:text-[#8B5CF6] transition-colors">
                        <span className="material-symbols-outlined">straighten</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-[#F5F5F4]">Units</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Metric (km/h)</span>
                    <span className="material-symbols-outlined text-zinc-400 text-lg">chevron_right</span>
                </div>
            </button>
        </DrivePopup>
    );
}
