'use client';

import Link from 'next/link';
import { useState } from 'react';

type Tab = 'feed' | 'groups' | 'dms';

export default function ExplorePage() {
    const [activeTab, setActiveTab] = useState<Tab>('feed');

    return (
        <div className="flex flex-col pb-24">
            {/* Tab Bar */}
            <div className="sticky top-0 z-30 bg-[#06040A]/95 backdrop-blur-md border-b border-[rgba(139,92,246,0.1)] px-4">
                <div className="flex gap-2 justify-center py-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-4 py-2 rounded-full transition-all ${activeTab === 'feed'
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Feed</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-4 py-2 rounded-full transition-all ${activeTab === 'groups'
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Groups</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('dms')}
                        className={`px-4 py-2 rounded-full transition-all ${activeTab === 'dms'
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20'
                            : 'bg-transparent text-[#A8A8A8] hover:text-[#F5F5F4] hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase">DMs</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-screen">
                {activeTab === 'feed' && <FeedView />}
                {activeTab === 'groups' && <GroupsView />}
                {activeTab === 'dms' && <MessagesView />}
            </div>
        </div>
    );
}

// --- Sub-Views ---

function FeedView() {
    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Create Post Input */}
            <div className="flex gap-3 items-center bg-[#0D0B14] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <div className="size-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-purple-400 p-[2px]">
                    <div className="size-full rounded-full bg-[#0D0B14] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#8B5CF6] text-lg">person</span>
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Share your drive..."
                    className="bg-transparent flex-1 text-sm text-white placeholder:text-[#A8A8A8] outline-none"
                    readOnly // decorative for now
                />
                <button className="text-[#8B5CF6]">
                    <span className="material-symbols-outlined">add_a_photo</span>
                </button>
            </div>

            {/* Posts */}
            <FeedPost
                author="Sarah Jenkins"
                handle="@sarah_j"
                time="2h ago"
                content="Late night run through the canyons. The fog was intense but the grip was perfect. 🌫️🏎️"
                image="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2938&auto=format&fit=crop"
                likes={124}
                comments={18}
            />
            <FeedPost
                author="Drift King"
                handle="@dk_official"
                time="4h ago"
                content="New setup feels dialed in. Who's coming to the meet tonight?"
                image="https://images.unsplash.com/photo-1580273916550-e323be2ebcc9?q=80&w=2000&auto=format&fit=crop"
                likes={892}
                comments={56}
            />
            <FeedPost
                author="Midnight Club"
                handle="@midnight_club"
                time="6h ago"
                content="Route map for tonight's cruise. Meet at 10PM sharp."
                likes={342}
                comments={45}
                isMap
            />
        </div>
    );
}

function GroupsView() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="text-[#A8A8A8] text-xs font-bold uppercase tracking-wider mb-2">Your Groups</h3>
            <GroupCard
                name="SoCal Porsches"
                members="1.2k members"
                active="24 active now"
                image="https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2000&auto=format&fit=crop"
            />
            <GroupCard
                name="Midnight Runners"
                members="450 members"
                active="82 active now"
                image="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2830&auto=format&fit=crop"
            />

            <h3 className="text-[#A8A8A8] text-xs font-bold uppercase tracking-wider mt-6 mb-2">Suggested</h3>
            <GroupCard
                name="JDM Legends"
                members="5.6k members"
                active="156 active now"
                image="https://images.unsplash.com/photo-1616422285623-13ff0162193b?q=80&w=2831&auto=format&fit=crop"
                isJoin
            />
        </div>
    );
}

function MessagesView() {
    return (
        <div className="flex flex-col">
            {/* Search */}
            <div className="px-4 py-3">
                <div className="bg-[#0D0B14] rounded-lg flex items-center px-3 py-2 border border-[rgba(255,255,255,0.05)]">
                    <span className="material-symbols-outlined text-[#A8A8A8] text-xl">search</span>
                    <input
                        type="text"
                        placeholder="Search messages"
                        className="bg-transparent ml-2 text-sm text-white placeholder:text-[#A8A8A8] outline-none flex-1"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col">
                <MessageRow
                    name="Marcus Chen"
                    lastMessage="Yo, you going to the meet tonight?"
                    time="10m"
                    unread
                />
                <MessageRow
                    name="Sarah Jenkins"
                    lastMessage="Thanks for the invite!"
                    time="2h"
                />
                <MessageRow
                    name="David Kim"
                    lastMessage="Sent you a route."
                    time="1d"
                    isRoute
                />
            </div>
        </div>
    );
}

// --- Components ---

function FeedPost({ author, handle, time, content, image, likes, comments, isMap }: any) {
    return (
        <div className="bg-[#0D0B14] rounded-xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3">
                <div className="size-10 rounded-full bg-[#1A1820] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#A8A8A8]">person</span>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-bold">{author}</span>
                        <span className="text-[10px] text-[#A8A8A8]">• {time}</span>
                    </div>
                    <span className="text-[#A8A8A8] text-xs">{handle}</span>
                </div>
                <button className="ml-auto text-[#A8A8A8]">
                    <span className="material-symbols-outlined">more_horiz</span>
                </button>
            </div>

            {/* Content */}
            <p className="text-[#F5F5F4] text-sm px-3 pb-3 leading-relaxed">
                {content}
            </p>

            {/* Media */}
            {image && (
                <div className="aspect-[4/3] w-full bg-[#1A1820] relative">
                    <img src={image} className="w-full h-full object-cover" alt="Post content" />
                </div>
            )}
            {isMap && (
                <div className="aspect-[16/9] w-full bg-[#1A1820] relative flex items-center justify-center border-t border-b border-[rgba(255,255,255,0.05)]">
                    <span className="material-symbols-outlined text-[#8B5CF6] text-5xl">map</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06040A] to-transparent opacity-50" />
                    <div className="absolute bottom-3 left-3 flex flex-col">
                        <span className="text-white text-sm font-bold">Midnight Loop</span>
                        <span className="text-[#A8A8A8] text-xs">12.4 mi • 45 min</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between p-3 border-t border-[rgba(255,255,255,0.05)]">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-[#A8A8A8] hover:text-[#EF4444] transition-colors">
                        <span className="material-symbols-outlined text-xl">favorite</span>
                        <span className="text-xs font-medium">{likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-[#A8A8A8] hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">chat_bubble</span>
                        <span className="text-xs font-medium">{comments}</span>
                    </button>
                </div>
                <button className="text-[#A8A8A8] hover:text-white">
                    <span className="material-symbols-outlined text-xl">share</span>
                </button>
            </div>
        </div>
    );
}

function GroupCard({ name, members, active, image, isJoin }: any) {
    const id = name === 'SoCal Porsches' ? 'porsche-club' : 'midnight-runners';

    return (
        <Link
            href={`/group/${id}`}
            className="bg-[#0D0B14] rounded-xl border border-[rgba(255,255,255,0.05)] p-3 flex items-center gap-4 hover:bg-[#1A1820] transition-colors cursor-pointer"
        >
            <div className="size-14 rounded-lg bg-[#1A1820] overflow-hidden relative shrink-0">
                <img src={image} className="w-full h-full object-cover" alt={name} />
            </div>
            <div className="flex flex-col flex-1">
                <h4 className="text-white font-bold text-sm">{name}</h4>
                <div className="flex flex-col">
                    <span className="text-[#A8A8A8] text-xs">{members}</span>
                    <span className="text-[#22C55E] text-[10px] font-medium flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-[#22C55E]" />
                        {active}
                    </span>
                </div>
            </div>
            <button className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors ${isJoin
                ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                : 'border-[rgba(255,255,255,0.2)] text-[#A8A8A8] hover:text-white'
                }`}>
                {isJoin ? 'Join' : 'View'}
            </button>
        </Link>
    );
}

function MessageRow({ name, lastMessage, time, unread, isRoute }: any) {
    // Generate a mock ID based on name for demo purposes
    const id = name === 'Marcus Chen' ? 'marcus-1' : name === 'Sarah Jenkins' ? 'sarah-1' : 'group-1';

    return (
        <Link
            href={`/chat/${id}`}
            className={`flex items-center gap-3 p-4 border-b border-[rgba(255,255,255,0.03)] hover:bg-[#0D0B14] transition-colors cursor-pointer ${unread ? 'bg-[#0D0B14]/50' : ''}`}
        >
            <div className="relative">
                <div className="size-12 rounded-full bg-[#1A1820] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#A8A8A8]">person</span>
                </div>
                {unread && (
                    <div className="absolute top-0 right-0 size-3 rounded-full bg-[#8B5CF6] border-2 border-[#06040A]" />
                )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-sm ${unread ? 'text-white font-bold' : 'text-[#F5F5F4] font-medium'}`}>{name}</span>
                    <span className="text-[10px] text-[#A8A8A8]">{time}</span>
                </div>
                <p className={`text-xs truncate flex items-center gap-1.5 ${unread ? 'text-white' : 'text-[#A8A8A8]'}`}>
                    {isRoute && <span className="material-symbols-outlined text-xs">map</span>}
                    {lastMessage}
                </p>
            </div>
        </Link>
    );
}
