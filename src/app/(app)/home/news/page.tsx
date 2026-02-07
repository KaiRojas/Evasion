'use client';

import { Suspense } from 'react';

// Topics config
const TOPICS = ['All', 'F1', 'Drift', 'JDM', 'Hypercars', 'Rally'];

function NewsContent() {
    return (
        <div className="flex flex-col animate-in fade-in duration-300">
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Topic Selector */}
            <div className="flex gap-3 px-5 py-4 overflow-x-auto hide-scrollbar whitespace-nowrap">
                {TOPICS.map((topic, index) => (
                    <button
                        key={topic}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg ${index === 0
                                ? 'bg-[#8B5CF6] text-white shadow-[#8B5CF6]/20'
                                : 'bg-[#0D0B14] text-[#A8A8A8] hover:bg-[#8B5CF6]/20 hover:text-white'
                            }`}
                    >
                        {topic}
                    </button>
                ))}
            </div>

            {/* News Feed */}
            <main className="flex flex-col gap-6 px-5 py-2 pb-8">
                {/* Card 1: F1 News */}
                <article className="flex flex-col overflow-hidden rounded-xl bg-[#0D0B14] shadow-sm border border-[rgba(255,255,255,0.05)]">
                    <div
                        className="relative w-full aspect-[16/9] bg-cover bg-center"
                        style={{
                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDQEGYzJ2HrdIuA1n6zNHVW1gSfX30BZN8aXFaUFw6dhBNCnvBbd-cd2FWEUKaKilS1iJp2ioBh4nlh7h4gBDHAI7UhtJK2Z_KGo-evcPnCBpDPo2a6AOS32-qn58uOopQFm-w78JMdaVvc3IPr1zIb58gPICCv03SLOUAmpKbYcXrQHM6kI68OoRzfE2Pk2aCTy9av-I8t2BCtFJmIYuTgaiW8w_eiLpWvC1aKCwkXOCqlecSAM_bZ6_foUZUe5rWDVfNC-RQolU')",
                        }}
                    >
                        <div className="absolute top-3 left-3 px-3 py-1 bg-[#8B5CF6] rounded-lg text-[10px] font-black uppercase tracking-tighter text-white">
                            F1 News
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-xl font-bold leading-tight tracking-tight text-[#F5F5F4]">
                            Verstappen Dominates at Spa: A Masterclass in Belgian Rain
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#A8A8A8]">
                            <span className="font-bold text-[#8B5CF6]">Autosport</span>
                            <span>•</span>
                            <span>2h ago</span>
                        </div>
                    </div>
                </article>

                {/* Card 2: Video Drift Card */}
                <article className="flex flex-col overflow-hidden rounded-xl bg-[#0D0B14] shadow-sm border border-[rgba(255,255,255,0.05)]">
                    <div
                        className="relative w-full aspect-[16/9] bg-cover bg-center group cursor-pointer"
                        style={{
                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZvVXTjtP5BX67Fd1NcFZviQgeXMZP6o87wRv3V8N_YH88fD6Nfb6kv5bGfC0FwtJ-rVYGtIrKOzF6mVCXEkmOkOky6DsUXMAWEt03mZiDLUsNNKKK1FctLM6f18ckP9OYERNS1Ocj55CJqTBC81MQpnklzl7H1VpT3wqrGckTvkSriQgBVlyJp0HsiFgSjEA9Y4YbmeC9eLBGOJx36mQCmrCAM1jJDZm090kjidMyTqSmMp0TwCDm-ijftkPratUGFPwa5Y2lYpY')",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl">
                                <span
                                    className="material-symbols-outlined text-4xl"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    play_arrow
                                </span>
                            </div>
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1 bg-[#8B5CF6]/80 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-tighter text-white">
                            Street
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-bold text-white">
                            2:45
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-xl font-bold leading-tight tracking-tight text-[#F5F5F4]">
                            Midnight Run: The Evolution of Street Drifting in Tokyo
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#A8A8A8]">
                            <span className="font-bold text-[#8B5CF6]">Evasion Culture</span>
                            <span>•</span>
                            <span>5h ago</span>
                        </div>
                    </div>
                </article>

                {/* Card 3: Hypercar Feature */}
                <article className="flex flex-col overflow-hidden rounded-xl bg-[#0D0B14] shadow-sm border border-[rgba(255,255,255,0.05)]">
                    <div
                        className="relative w-full aspect-[16/9] bg-cover bg-center"
                        style={{
                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGVcCI8I8XevLBv_WFQhRe1IqEHtnhbNVwlbxmvagsQB05cf1kEK5MHjBubSLhwYRLhTyaNooDqKmWncGLTOZQRLf985yP6EVllwjgSCiiVRTissgvWNVXpyZszOH3mcAHEqpFvkEf1cL3o2K2pNiEVrEW07rT3QH29mmH6Msdm9oU07-hjEx_4qM54VlGzjSuZXGDJBFz5ZX9FCv67DgCfie4kYC19j3M7Jm7PmvYIi_iawCs59nEVc3H5A8_77hMHQNZKia8O30')",
                        }}
                    >
                        <div className="absolute top-3 left-3 px-3 py-1 bg-[#8B5CF6] rounded-lg text-[10px] font-black uppercase tracking-tighter text-white">
                            Tech
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <h3 className="text-xl font-bold leading-tight tracking-tight text-[#F5F5F4]">
                            Internal Combustion's Last Stand: The New Hybrid Monsters
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#A8A8A8]">
                            <span className="font-bold text-[#8B5CF6]">EVASION Mag</span>
                            <span>•</span>
                            <span>8h ago</span>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}

export default function NewsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full" />
            </div>
        }>
            <NewsContent />
        </Suspense>
    );
}
